import { Router } from "express";
import * as DocumentController from "../controllers/document.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// All document routes require authentication
router.use(authenticateToken);

// GET all documents
router.get("/", DocumentController.getDocuments);

// GET single document
router.get("/:id", DocumentController.getDocumentById);

// POST create document
router.post("/", DocumentController.createDocument);

// PUT update document
router.put("/:id", DocumentController.updateDocument);

// DELETE document
router.delete("/:id", DocumentController.deleteDocument);

export default router;
