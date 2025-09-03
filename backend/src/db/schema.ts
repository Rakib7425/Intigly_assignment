import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  isOnline: boolean().notNull().default(false),
  createdAt: timestamp().defaultNow(),
});

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull().default("New Document"),
  serverVersion: integer("").notNull().default(0),
  createdBy: integer()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdByUsername: text()
    .notNull()
    .references(() => users.username, { onDelete: "cascade" }),

  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chatMessages", {
  id: serial().primaryKey(),
  documentId: integer()
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  userId: integer()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  message: text().notNull(),
  createdAt: timestamp().defaultNow(),
});
