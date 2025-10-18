import { type User, type InsertUser, type WhiteboardSession, type InsertWhiteboardSession, type DrawingStroke, type ActiveUser } from "@shared/schema";
import { randomUUID } from "crypto";

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

export interface SessionData {
  id: string;
  name: string;
  strokes: DrawingStroke[];
  images: CanvasImage[];
  texts: CanvasText[];
  shapes: CanvasShape[];
  users: Map<string, ActiveUser>;
  createdAt: Date;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createSession(session: InsertWhiteboardSession): Promise<WhiteboardSession>;
  getSession(id: string): Promise<SessionData | undefined>;
  getAllSessions(): Promise<SessionData[]>;
  
  addStrokeToSession(sessionId: string, stroke: DrawingStroke): Promise<void>;
  addImageToSession(sessionId: string, image: CanvasImage): Promise<void>;
  addTextToSession(sessionId: string, text: CanvasText): Promise<void>;
  addShapeToSession(sessionId: string, shape: CanvasShape): Promise<void>;
  clearSession(sessionId: string): Promise<void>;
  
  addUserToSession(sessionId: string, user: ActiveUser): Promise<void>;
  removeUserFromSession(sessionId: string, userId: string): Promise<void>;
  updateUserCursor(sessionId: string, userId: string, x: number, y: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sessions: Map<string, SessionData>;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSession(insertSession: InsertWhiteboardSession): Promise<WhiteboardSession> {
    const id = randomUUID();
    const session: WhiteboardSession = {
      ...insertSession,
      id,
      createdAt: new Date(),
    };
    
    const sessionData: SessionData = {
      ...session,
      strokes: [],
      images: [],
      texts: [],
      shapes: [],
      users: new Map(),
    };
    
    this.sessions.set(id, sessionData);
    return session;
  }

  async getSession(id: string): Promise<SessionData | undefined> {
    return this.sessions.get(id);
  }

  async getAllSessions(): Promise<SessionData[]> {
    return Array.from(this.sessions.values());
  }

  async addStrokeToSession(sessionId: string, stroke: DrawingStroke): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.strokes.push(stroke);
    }
  }

  async addImageToSession(sessionId: string, image: CanvasImage): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.images.push(image);
    }
  }

  async addTextToSession(sessionId: string, text: CanvasText): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.texts.push(text);
    }
  }

  async addShapeToSession(sessionId: string, shape: CanvasShape): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.shapes.push(shape);
    }
  }

  async clearSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.strokes = [];
      session.images = [];
      session.texts = [];
      session.shapes = [];
    }
  }

  async addUserToSession(sessionId: string, user: ActiveUser): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.users.set(user.id, user);
    }
  }

  async removeUserFromSession(sessionId: string, userId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.users.delete(userId);
    }
  }

  async updateUserCursor(sessionId: string, userId: string, x: number, y: number): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      const user = session.users.get(userId);
      if (user) {
        user.cursor = { x, y };
      }
    }
  }
}

export const storage = new MemStorage();
