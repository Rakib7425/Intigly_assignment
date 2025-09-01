import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

// REST routes
import authRoutes from "./src/routes/auth.routes";
import docRoutes from "./src/routes/document.routes";
import chatRoutes from "./src/routes/chat.routes";

import socketHandler from "./src/socket/socketHandler.js";

import { DatabaseManager } from "./src/db/databaseManager.js";
import { RedisManager } from "./src/db/redis.ts";

async function startServer() {
  try {
    const dbManager = new DatabaseManager();
    const redisManager = new RedisManager();

    await dbManager.initialize();
    await redisManager.initialize();

    console.log("✅ Database and Redis connected");

    const app = express();
    const server = createServer(app);

    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    app.use(
      cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: true,
      })
    );
    app.use(express.json());

    // Health check
    app.get("/health", (_, res) => res.json({ ok: true }));

    // REST routes
    app.use("/api/auth", authRoutes);
    app.use("/api/documents", docRoutes);
    app.use("/api/chat", chatRoutes);

    socketHandler(io);

    // Start server
    const PORT = Number(process.env.PORT || 3001);
    server.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
