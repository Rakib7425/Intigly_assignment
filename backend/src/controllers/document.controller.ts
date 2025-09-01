import { Request, Response } from "express";
import * as DocumentService from "../services/document.service.ts";

export async function getDocuments(req: Request, res: Response) {
  try {
    const docs = await DocumentService.getDocuments();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: "failed to fetch docs" });
  }
}

export async function getDocumentById(req: Request, res: Response) {
  try {
    const doc = await getDocument(Number(req.params.id));
    if (!doc) return res.status(404).json({ error: "not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: "failed to fetch doc" });
  }
}

export async function createDocument(req: Request, res: Response) {
  try {
    const { title, userId } = req.body;
    if (!title || !userId) {
      return res.status(400).json({ error: "title and userId required" });
    }
    const doc = await DocumentService.createDocument(title, userId);
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: "failed to create doc" });
  }
}
