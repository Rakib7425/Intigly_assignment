import { Router } from "express";
import * as DocumentController from "../controllers/document.controller";

const router = Router();

// GET all documents
router.get("/", DocumentController.getDocuments);

// GET single document
router.get("/:id", DocumentController.getDocumentById);

// POST create document
router.post("/", DocumentController.createDocument);

export default router;
