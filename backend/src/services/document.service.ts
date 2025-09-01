import { SocketManager } from "./SocketManager.ts";

export const getDocuments = (socketManager: SocketManager) => {
  socketManager.emit("getDocuments");
};

export const onDocuments = (
  socketManager: SocketManager,
  callback: (docs: any[]) => void
) => {
  socketManager.on("documents", callback);
};

export const createDocument = (socketManager: SocketManager, title: string) => {
  socketManager.emit("createDocument", { title });
};

export const onDocumentCreated = (
  socketManager: SocketManager,
  callback: (doc: any) => void
) => {
  socketManager.on("documentCreated", callback);
};

export const joinDocument = (
  socketManager: SocketManager,
  documentId: number
) => {
  socketManager.emit("joinDocument", { documentId });
};

export const onDocumentJoined = (
  socketManager: SocketManager,
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
  socketManager: SocketManager,
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
  socketManager: SocketManager,
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
  socketManager: SocketManager,
  callback: (data: { content: string; serverVersion: number }) => void
) => {
  socketManager.on("content:reject", (data) => {
    callback(data as { content: string; serverVersion: number });
  });
};
