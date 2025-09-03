import { Router } from "express";
import * as LiveblocksController from "../controllers/liveblocks.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// All Liveblocks routes require authentication
router.use(authenticateToken);

// POST authorize user for Liveblocks room
router.post("/authorize", LiveblocksController.authorize);

// GET room information
router.get("/room/:roomId", LiveblocksController.getRoomInfo);

export default router;
