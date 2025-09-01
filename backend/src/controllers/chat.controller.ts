import { Request, Response } from "express";
import * as ChatService from "../services/chat.service.ts";

export async function getMessages(req: Request, res: Response) {
  try {
    const documentId = Number(req.params.documentId);
    const messages = await ChatService.getMessages(documentId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "failed to fetch messages" });
  }
}

export async function sendMessage(req: Request, res: Response) {
  try {
    const documentId = Number(req.params.documentId);
    const { userId, message } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ error: "userId and message required" });
    }
    const msg = await ChatService.addMessage(documentId, userId, message);
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: "failed to send message" });
  }
}
