import { Router } from "express";
import * as AuthController from "../controllers/auth.controller.ts";

const router = Router();

// Register or login user
router.post("/login", AuthController.login);

export default router;
