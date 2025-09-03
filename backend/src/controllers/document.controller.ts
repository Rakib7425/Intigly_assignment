import { Request, Response } from "express";
import * as DocumentService from "../services/document.service.ts";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { logError, logMessage } from "../utils/logger.ts";

export async function getDocuments(req: AuthenticatedRequest, res: Response) {
  try {
    logMessage("Fetching documents for user:", req.user?.userId);
    const docs = await DocumentService.getDocuments();
    res.json(docs);
  } catch (err) {
    logError("Failed to fetch documents:", err);
    res.status(500).json({ error: "failed to fetch documents" });
  }
}

export async function getDocumentById(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req.params;
    logMessage("Fetching document:", id);

    const doc = await DocumentService.getDocumentById(Number(id));
    if (!doc) {
      return res.status(404).json({ error: "document not found" });
    }

    res.json(doc);
  } catch (err) {
    logError("Failed to fetch document:", err);
    res.status(500).json({ error: "failed to fetch document" });
  }
}

export async function createDocument(req: AuthenticatedRequest, res: Response) {
  try {
    const { title } = req.body;
    const userId = req.user?.userId;
    const username = req.user?.username;

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    if (!userId) {
      return res.status(401).json({ error: "user not authenticated" });
    }

    logMessage("Creating document:", title, "for user:", userId);
    const doc = await DocumentService.createDocument(title, userId, username);
    res.status(201).json(doc);
  } catch (err) {
    logError("Failed to create document:", err);
    res.status(500).json({ error: "failed to create document" });
  }
}

export async function updateDocument(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "user not authenticated" });
    }

    logMessage("Updating document:", id);
    const doc = await DocumentService.updateDocument(
      Number(id),
      { title, content },
      userId
    );

    if (!doc) {
      return res.status(404).json({ error: "document not found" });
    }

    res.json(doc);
  } catch (err) {
    logError("Failed to update document:", err);
    res.status(500).json({ error: "failed to update document" });
  }
}

export async function deleteDocument(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "user not authenticated" });
    }

    logMessage("Deleting document:", id);
    const success = await DocumentService.deleteDocument(Number(id), userId);

    if (!success) {
      return res.status(404).json({ error: "document not found" });
    }

    res.json({ message: "document deleted successfully" });
  } catch (err) {
    logError("Failed to delete document:", err);
    res.status(500).json({ error: "failed to delete document" });
  }
}
