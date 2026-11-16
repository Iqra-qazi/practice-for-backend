import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "../src/db/db.js";
import userModel from "../src/models/users.model.js";
import { AdminSeedError, seedAdminAccount } from "../src/utils/adminSeed.js";

if (!process.env.ADMIN_SEED_EMAIL || !process.env.ADMIN_SEED_PASSWORD) {
  throw new Error("ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must be configured.");
}

try {
  await connectDB();
  await seedAdminAccount({
    userModel,
    hashPassword: (password) => bcrypt.hash(password, 10),
    email: process.env.ADMIN_SEED_EMAIL,
    password: process.env.ADMIN_SEED_PASSWORD,
  });
  console.log("Admin seed completed.");
} catch (error) {
  console.error(error instanceof AdminSeedError ? error.message : "Admin seed failed.");
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => console.error("MongoDB disconnect failed."));
}
