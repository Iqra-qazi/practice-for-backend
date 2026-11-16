import mongoose from "mongoose";
import userModel from "../models/users.model.js";
import { serializeAdminUser } from "../utils/adminUser.js";

const safeFields = "_id username email role status createdAt updatedAt";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function escapedRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function adminConflict(res, message) {
  return res.status(409).json({ success: false, message });
}

export async function listUsers(req, res) {
  const page = Number.parseInt(req.query.page ?? "1", 10);
  const limit = Number.parseInt(req.query.limit ?? "20", 10);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid pagination parameters",
    });
  }

  const pageSize = Math.min(limit, 100);
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const role = typeof req.query.role === "string" ? req.query.role : "";
  const status = typeof req.query.status === "string" ? req.query.status : "";

  if (role && !["user", "admin"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role filter" });
  }
  if (status && !["active", "blocked"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status filter" });
  }

  const conditions = [];
  if (search) {
    conditions.push({
      $or: [
        { username: { $regex: escapedRegex(search), $options: "i" } },
        { email: { $regex: escapedRegex(search), $options: "i" } },
      ],
    });
  }
  if (role) conditions.push({ role });
  if (status === "active") {
    conditions.push({ $or: [{ status: "active" }, { status: null }] });
  } else if (status) {
    conditions.push({ status });
  }
  const filter = conditions.length ? { $and: conditions } : {};

  const [users, total] = await Promise.all([
    userModel
      .find(filter)
      .select(safeFields)
      .sort({ createdAt: -1, _id: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    userModel.countDocuments(filter),
  ]);

  return res.json({
    success: true,
    data: users.map(serializeAdminUser),
    pagination: {
      page,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

export async function getStats(req, res) {
  const [totalUsers, blockedUsers, adminUsers] = await Promise.all([
    userModel.countDocuments(),
    userModel.countDocuments({ status: "blocked" }),
    userModel.countDocuments({ role: "admin" }),
  ]);

  return res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers: totalUsers - blockedUsers,
      blockedUsers,
      adminUsers,
    },
  });
}

export async function changeUserRole(req, res) {
  const { id } = req.params;
  const { role } = req.body ?? {};

  if (!isValidId(id)) {
    return res.status(400).json({ success: false, message: "Invalid user id" });
  }
  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ success: false, message: "Role must be user or admin" });
  }

  const user = await userModel.findById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  if (String(user._id) === String(req.user.id) && role !== "admin") {
    return adminConflict(res, "You cannot demote your own account");
  }

  if (user.role === "admin" && role !== "admin") {
    const otherActiveAdmins = await userModel.countDocuments({
      role: "admin",
      status: { $ne: "blocked" },
      _id: { $ne: user._id },
    });
    if (otherActiveAdmins === 0) {
      return adminConflict(res, "Cannot demote the last active admin");
    }
  }

  user.role = role;
  await user.save();
  return res.json({ success: true, data: serializeAdminUser(user) });
}

export async function setUserStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body ?? {};

  if (!isValidId(id)) {
    return res.status(400).json({ success: false, message: "Invalid user id" });
  }
  if (!["active", "blocked"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be active or blocked",
    });
  }

  const user = await userModel.findById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  if (status === "blocked" && String(user._id) === String(req.user.id)) {
    return adminConflict(res, "You cannot block your own account");
  }

  if (status === "blocked" && user.role === "admin") {
    const otherActiveAdmins = await userModel.countDocuments({
      role: "admin",
      status: { $ne: "blocked" },
      _id: { $ne: user._id },
    });
    if (otherActiveAdmins === 0) {
      return adminConflict(res, "Cannot block the last active admin");
    }
  }

  user.status = status;
  await user.save();
  return res.json({ success: true, data: serializeAdminUser(user) });
}

export async function deleteUser(req, res) {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ success: false, message: "Invalid user id" });
  }
  const user = await userModel.findById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  if (String(user._id) === String(req.user.id)) {
    return adminConflict(res, "You cannot delete your own account");
  }

  if (user.role === "admin") {
    const otherActiveAdmins = await userModel.countDocuments({
      role: "admin",
      status: { $ne: "blocked" },
      _id: { $ne: user._id },
    });
    if (otherActiveAdmins === 0) {
      return adminConflict(res, "Cannot delete the last active admin");
    }
  }

  await user.deleteOne();
  return res.json({ success: true, message: "User deleted" });
}
