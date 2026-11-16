import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.js";
import {
  changeUserRole,
  deleteUser,
  getStats,
  listUsers,
  setUserStatus,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(authenticateToken, authorize("admin"));
router.get("/users", listUsers);
router.get("/stats", getStats);
router.patch("/users/:id/role", changeUserRole);
router.patch("/users/:id/status", setUserStatus);
router.delete("/users/:id", deleteUser);

export default router;
