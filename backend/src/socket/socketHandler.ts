import { createAuthService } from "../services/auth.service.ts";
import { createPresenceService } from "../services/presence.service.ts";
import { DatabaseManager } from "../db/databaseManager.js";
import { RedisManager } from "../db/redis.ts";

// Initialize services with their dependencies
const dbManager = new DatabaseManager();
const redisManager = new RedisManager();

const authService = createAuthService(dbManager);
const presenceService = createPresenceService(redisManager);

export function socketHandler(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Connected:", socket.id);

    socket.on("authenticate", async ({ username }) => {
      try {
        console.log("Authentication request for:", username);

        const user = await authService.ensureUser(username, socket);

        socket.data.userId = user.id;
        socket.data.username = user.username;

        // Use the presence service
        await presenceService.addActiveUser(user.username);
        const active = await presenceService.getActiveUsers();

        io.emit("activeUsers", active);
        socket.emit("authenticated", user);

        console.log("User authenticated successfully:", user.username);
      } catch (err) {
        console.error("Auth error:", err);
        socket.emit("auth:error", { message: "Authentication failed" });
      }
    });

    socket.on("joinDocument", async ({ documentId }) => {
      if (!socket.data.userId) return;

      const room = `doc:${documentId}`;
      socket.join(room);

      // Use presence service
      await presenceService.addUserToDocument(documentId, socket.data.username);

      const doc = await DocumentService.getDocuments(documentId);
      const messages = await ChatService.getMessages(documentId);
      const users = await presenceService.getDocumentUsers(documentId);
      const cursors = await presenceService.getDocumentCursors(documentId);

      socket.emit("documentJoined", { doc, messages, users, cursors });
      socket.to(room).emit("presence:update", { users });
    });

    socket.on("documentEdit", async ({ documentId, content, cursor }) => {
      if (!socket.data.userId) return;

      const doc = await DocumentService.updateDocument(documentId, content);
      const room = `doc:${documentId}`;

      socket.to(room).emit("documentUpdate", {
        content,
        author: socket.data.username,
      });

      if (cursor) {
        // Use presence service
        await presenceService.updateCursor(
          documentId,
          socket.data.username,
          cursor
        );
        const cursors = await presenceService.getDocumentCursors(documentId);
        io.to(room).emit("cursorsUpdate", cursors);
      }
    });

    socket.on("disconnect", async () => {
      if (socket.data.username) {
        // Use presence service
        await presenceService.removeActiveUser(socket.data.username);
        const active = await presenceService.getActiveUsers();
        io.emit("activeUsers", active);

        // Clean up any document presence
        // You might want to track which documents the user was in
      }
    });
  });
}
