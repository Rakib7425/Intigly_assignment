import { Request, Response } from "express";
import * as AuthService from "../services/auth.service.ts";
import socketHandler from "../socket/socketHandler.ts";
import { DatabaseManager } from "../db/databaseManager.ts";

export async function login(req: Request, res: Response) {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "username required" });
    }

    const user = await AuthService.ensureUser(
      socketHandler,
      username,
      DatabaseManager
    );
    return res.json(user);
  } catch (err) {
    console.error("auth error:", err);
    return res.status(500).json({ error: "login failed" });
  }
}
