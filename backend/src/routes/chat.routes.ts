import { Router } from "express";
import * as ChatController from "../controllers/chat.controller";

const router = Router();

// Get messages for a document
router.get("/:documentId", ChatController.getMessages);

// Send new message
router.post("/:documentId", ChatController.sendMessage);

export default router;
