import { Router } from "express";
import * as AuthController from "../controllers/auth.controller.ts";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Register or login user
router.post("/login", AuthController.login);

// Verify token
router.post("/verify", AuthController.verifyToken);

export default router;
