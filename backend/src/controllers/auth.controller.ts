import { Request, Response } from "express";
import { DatabaseManager } from "../db/databaseManager.ts";
import { generateToken } from "../utils/jwt.js";
import { logError, logMessage } from "../utils/logger.ts";

const dbManager = new DatabaseManager();

export async function login(req: Request, res: Response) {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "username required" });
    }

    logMessage("Login attempt for:", username);

    // Check if user exists, create if not
    let user = await dbManager.getUserByUsername(username);

    if (!user) {
      user = await dbManager.createUser(username);
      logMessage("New user created:", user);
    } else {
      logMessage("Existing user found:", user);
    }

    // Generate JWT token
    const token = generateToken(user.id, user.username);

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    logError("Login error:", err);
    return res.status(500).json({ error: "login failed" });
  }
}

export async function verifyToken(req: Request, res: Response) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "token required" });
    }

    // Token verification is handled by middleware
    // If we reach here, token is valid
    return res.json({ valid: true });
  } catch (err) {
    logError("Token verification error:", err);
    return res.status(500).json({ error: "token verification failed" });
  }
}
