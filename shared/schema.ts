import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const whiteboardSessions = pgTable("whiteboard_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWhiteboardSessionSchema = createInsertSchema(whiteboardSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertWhiteboardSession = z.infer<typeof insertWhiteboardSessionSchema>;
export type WhiteboardSession = typeof whiteboardSessions.$inferSelect;

export interface DrawPoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface DrawingStroke {
  id: string;
  points: DrawPoint[];
  color: string;
  width: number;
  tool: 'pen' | 'eraser';
  userId: string;
}

export interface ActiveUser {
  id: string;
  username: string;
  color: string;
  cursor?: { x: number; y: number };
}
