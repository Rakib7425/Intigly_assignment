import { Request, Response } from "express";
import { liveblocksClient } from "../config/liveblocks.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logError, logMessage } from "../utils/logger.ts";

export async function authorize(req: AuthenticatedRequest, res: Response) {
  try {
    const { room } = req.body;
    const userId = req.user?.userId;
    const username = req.user?.username;

    if (!userId || !username) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Debug log to confirm values
    logMessage(
      "Authorizing user for room:",
      room,
      "user:",
      username,
      "id:",
      userId
    );

    // Ensure userId is always a string
    const session = liveblocksClient.prepareSession(String(userId), {
      userInfo: {
        name: username,
        color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
      },
    });

    // Give the user access to the room
    session.allow(room, session.FULL_ACCESS);

    const { status, body } = await session.authorize();

    logMessage("Liveblocks authorization result:", status);
    return res.status(status).json(body);
  } catch (error) {
    logError("Liveblocks authorization error:", error);
    return res.status(500).json({ error: "Authorization failed" });
  }
}

export async function getRoomInfo(req: AuthenticatedRequest, res: Response) {
  try {
    const { roomId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    logMessage("Getting room info for:", roomId, "requested by user:", userId);

    const room = await liveblocksClient.getRoom(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    return res.json(room);
  } catch (error) {
    logError("Error getting room info:", error);
    return res.status(500).json({ error: "Failed to get room info" });
  }
}
