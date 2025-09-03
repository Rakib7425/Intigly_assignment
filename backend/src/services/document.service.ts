import { eq } from "drizzle-orm/sql/expressions/conditions";
import { DatabaseManager } from "../db/databaseManager.ts";
import { documents, users } from "../db/schema.ts";
import { logError, logMessage } from "../utils/logger.ts";

const dbManager = new DatabaseManager();
const { db } = dbManager;

export const getDocuments = async () => {
  try {
    const allDocs = await db.select().from(documents);
    logMessage("Fetched documents:", allDocs.length);
    return allDocs;
  } catch (error) {
    logError("Error fetching documents:", error);
    throw error;
  }
};

export const getDocumentById = async (id: number) => {
  try {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));

    if (!doc) {
      return null;
    }

    logMessage("Fetched document:", id);
    return doc;
  } catch (error) {
    logError("Error fetching document:", error);
    throw error;
  }
};

export const createDocument = async (
  title: string,
  userId: string,
  username: string
) => {
  try {
    const [newDoc] = await db
      .insert(documents)
      .values({
        title,
        content: "",
        serverVersion: 0,
        createdBy: userId,
        createdByUsername: username,
      })
      .returning();

    return newDoc;
  } catch (error) {
    logError("Error creating document:", error);
    throw error;
  }
};

export const updateDocument = async (
  id: number,
  updates: { title?: string; content?: string },
  userId: string
) => {
  try {
    const [updatedDoc] = await db
      .update(documents)
      .set({
        ...updates,
        serverVersion: db
          .select()
          .from(documents)
          .where(eq(documents.id, id))
          .then((docs) => (docs[0]?.serverVersion || 0) + 1),
      })
      .where(eq(documents.id, id))
      .returning();

    if (!updatedDoc) {
      return null;
    }

    logMessage("Document updated:", id);
    return updatedDoc;
  } catch (error) {
    logError("Error updating document:", error);
    throw error;
  }
};

export const deleteDocument = async (id: number, userId: string) => {
  try {
    const result = await db
      .delete(documents)
      .where(eq(documents.id, id))
      .returning();

    if (result.length === 0) {
      return false;
    }

    logMessage("Document deleted:", id);
    return true;
  } catch (error) {
    logError("Error deleting document:", error);
    throw error;
  }
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
