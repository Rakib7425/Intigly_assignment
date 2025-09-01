import { eq } from "drizzle-orm/sql/expressions/conditions";
import { DatabaseManager } from "../db/databaseManager.ts";
import { documents, users } from "../db/schema.ts";
import socketHandler from "../socket/socketHandler.ts";
const { db } = new DatabaseManager();

export const getDocuments = async () => {
  const allDocs = await db.select().from(documents);
  // console.log("Fetched documents:", allDocs);
  return allDocs;
};
export const ensureUser = async (username: string) => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, username));
  if (!user) throw new Error("User not found");
  return user;
};

export const createDocument = async (title: string, username: string) => {
  await ensureUser(username);

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username));

  const [newDoc] = await db
    .insert(documents)
    .values({
      title,
      content: "New Document",
      server_version: 0,
      created_by: user.id,
      created_by_username: user.username,

      createdBy: user.id,
      createdByUsername: user.username,
    })
    .returning();

  // console.log("New document created:", newDoc);
  return newDoc;
};

export const onDocumentCreated = async (
  socketManager: socketHandler,
  callback: (doc: any) => void
) => {
  socketManager.on("documentCreated", callback);
};

export const joinDocument = (
  socketManager: socketHandler,
  documentId: number
) => {
  socketManager.emit("joinDocument", { documentId });
};

export const getMessagesByDocumentId = (
  socketManager: socketHandler,
  documentId: number
) => {
  socketManager.emit("getMessages", { documentId });
};

export const onDocumentJoined = (
  socketManager: socketHandler,
  callback: (data: {
    document: any;
    chat: any[];
    presentUsers: string[];
    cursors: Record<string, any>;
  }) => void
) => {
  socketManager.on("documentJoined", callback);
};

export const sendEdit = (
  socketManager: socketHandler,
  documentId: number,
  content: string,
  clientVersion?: number,
  cursor?: any
) => {
  socketManager.emit("documentEdit", {
    documentId,
    content,
    clientVersion,
    cursor,
  });
};

export const onDocumentUpdate = (
  socketManager: socketHandler,
  callback: (data: {
    content: string;
    author: string;
    serverVersion: number;
  }) => void
) => {
  socketManager.on("documentUpdate", (data) => {
    callback(
      data as { content: string; author: string; serverVersion: number }
    );
  });
};

export const onContentReject = (
  socketManager: socketHandler,
  callback: (data: { content: string; serverVersion: number }) => void
) => {
  socketManager.on("content:reject", (data) => {
    callback(data as { content: string; serverVersion: number });
  });
};
