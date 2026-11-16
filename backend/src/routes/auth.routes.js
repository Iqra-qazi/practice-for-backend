import express from "express";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
const router = express.Router();
// /api/auth/register
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", authenticateToken, getCurrentUser);

export default router;