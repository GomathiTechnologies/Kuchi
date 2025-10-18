import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { insertWhiteboardSessionSchema } from "@shared/schema";
import type { DrawingStroke, ActiveUser } from "@shared/schema";

interface CanvasImage {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dataUrl: string;
}

interface CanvasText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
}

interface CanvasShape {
  id: string;
  type: 'rectangle' | 'circle' | 'arrow';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
}

const USER_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#a855f7',
  '#ec4899',
  '#f97316',
  '#eab308',
  '#ef4444',
  '#14b8a6',
];

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/sessions", async (req, res) => {
    try {
      const data = insertWhiteboardSessionSchema.parse(req.body);
      const session = await storage.createSession(data);
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      const users = Array.from(session.users.values());
      
      res.json({
        id: session.id,
        name: session.name,
        strokes: session.strokes,
        images: session.images,
        texts: session.texts,
        shapes: session.shapes,
        users,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-session", async (data: { sessionId: string; username: string }) => {
      const { sessionId, username } = data;
      
      const session = await storage.getSession(sessionId);
      if (!session) {
        socket.emit("error", { message: "Session not found" });
        return;
      }

      socket.join(sessionId);

      const colorIndex = session.users.size % USER_COLORS.length;
      const user: ActiveUser = {
        id: socket.id,
        username,
        color: USER_COLORS[colorIndex],
      };

      await storage.addUserToSession(sessionId, user);

      const users = Array.from(session.users.values());

      socket.emit("session-joined", {
        userId: socket.id,
        strokes: session.strokes,
        images: session.images,
        texts: session.texts,
        shapes: session.shapes,
        users,
      });

      socket.to(sessionId).emit("user-joined", user);

      console.log(`User ${username} joined session ${sessionId}`);
    });

    socket.on("draw-stroke", async (data: { sessionId: string; stroke: DrawingStroke }) => {
      const { sessionId, stroke } = data;
      await storage.addStrokeToSession(sessionId, stroke);
      socket.to(sessionId).emit("stroke-added", stroke);
    });

    socket.on("add-image", async (data: { sessionId: string; image: CanvasImage }) => {
      const { sessionId, image } = data;
      await storage.addImageToSession(sessionId, image);
      socket.to(sessionId).emit("image-added", image);
    });

    socket.on("add-text", async (data: { sessionId: string; text: CanvasText }) => {
      const { sessionId, text } = data;
      await storage.addTextToSession(sessionId, text);
      socket.to(sessionId).emit("text-added", text);
    });

    socket.on("add-shape", async (data: { sessionId: string; shape: CanvasShape }) => {
      const { sessionId, shape } = data;
      await storage.addShapeToSession(sessionId, shape);
      socket.to(sessionId).emit("shape-added", shape);
    });

    socket.on("clear-canvas", async (data: { sessionId: string }) => {
      const { sessionId } = data;
      await storage.clearSession(sessionId);
      io.to(sessionId).emit("canvas-cleared", { clearedBy: socket.id });
    });

    socket.on("cursor-move", async (data: { sessionId: string; x: number; y: number }) => {
      const { sessionId, x, y } = data;
      await storage.updateUserCursor(sessionId, socket.id, x, y);
      socket.to(sessionId).emit("cursor-updated", { userId: socket.id, x, y });
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);
      
      const sessions = await storage.getAllSessions();
      for (const session of sessions) {
        if (session.users.has(socket.id)) {
          await storage.removeUserFromSession(session.id, socket.id);
          io.to(session.id).emit("user-left", socket.id);
        }
      }
    });
  });

  return httpServer;
}
