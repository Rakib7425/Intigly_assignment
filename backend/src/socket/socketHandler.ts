import { Server, Socket } from "socket.io";
import * as AuthService from "../services/auth.service.ts";
import * as DocumentService from "../services/document.service.js";
import * as ChatService from "../services/chat.service.ts";
import * as PresenceService from "../services/presence.service.ts";
import { SocketManager } from "../services/SocketManager.ts";

export function socketHandler(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Connected:", socket.id);

    socket.on("authenticate", async ({ username }) => {
      try {
        const user = await AuthService.ensureUser(SocketManager, username);
        socket.data.userId = user.id;
        socket.data.username = user.username;
        await PresenceService.addActiveUser(user.username);

        const active = await PresenceService.getActiveUsers();
        io.emit("activeUsers", active);
        socket.emit("authenticated", user);
      } catch (err) {
        socket.emit("auth:error", { message: "auth failed" });
      }
    });

    socket.on("createDocument", async ({ title }) => {
      if (!socket.data.userId)
        return socket.emit("error", { message: "not authenticated" });
      const doc = await DocumentService.createDocument(
        title,
        socket.data.userId
      );
      socket.emit("documentCreated", doc);
      io.emit("documents:updated");
    });
    socket.on("getDocuments", async () => {
      try {
        const docs = await DocumentService.getDocuments();
        socket.emit("documents", docs);
      } catch (err) {
        console.error(err);
        socket.emit("error", { message: "failed to fetch documents" });
      }
    });

    socket.on("joinDocument", async ({ documentId }) => {
      if (!socket.data.userId) return;
      const room = `doc:${documentId}`;
      socket.join(room);

      await PresenceService.addUserToDocument(documentId, socket.data.username);

      const doc = await DocumentService.getDocuments(documentId);
      const messages = await ChatService.getMessages(documentId);
      const users = await PresenceService.getDocumentUsers(documentId);
      const cursors = await PresenceService.getDocumentCursors(documentId);

      socket.emit("documentJoined", { doc, messages, users, cursors });
      socket.to(room).emit("presence:update", { users });
    });

    socket.on("documentEdit", async ({ documentId, content, cursor }) => {
      if (!socket.data.userId) return;
      const doc = await DocumentService.updateDocument(documentId, content);
      const room = `doc:${documentId}`;
      socket
        .to(room)
        .emit("documentUpdate", { content, author: socket.data.username });

      if (cursor) {
        await PresenceService.updateCursor(
          documentId,
          socket.data.username,
          cursor
        );
        const cursors = await PresenceService.getDocumentCursors(documentId);
        io.to(room).emit("cursorsUpdate", cursors);
      }
    });

    socket.on("sendMessage", async ({ documentId, message }) => {
      if (!socket.data.userId) return;
      const msg = await ChatService.addMessage(
        documentId,
        socket.data.userId,
        message
      );
      io.to(`doc:${documentId}`).emit("chat:new", msg);
    });

    socket.on("disconnect", async () => {
      if (socket.data.username) {
        await PresenceService.removeActiveUser(socket.data.username);
        const active = await PresenceService.getActiveUsers();
        io.emit("activeUsers", active);
      }
    });
  });
}
