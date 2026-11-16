import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes.js";
import googleAuthRoutes from "./routes/googleAuth.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin === process.env.CLIENT_URL) {
        return callback(null, true);
      }

      const error = new Error("Origin is not allowed.");
      error.status = 403;
      return callback(error);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuthRoutes);
app.use("/api/admin", adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Not found." });
});

app.use((error, _req, res, next) => {
  if (res.headersSent) return next(error);

  const status = Number(error.status ?? error.statusCode);
  if (status === 413) {
    return res.status(413).json({ success: false, message: "Request body is too large." });
  }
  if (status === 400) {
    return res.status(400).json({ success: false, message: "Invalid request." });
  }
  if (status === 403) {
    return res.status(403).json({ success: false, message: "Forbidden." });
  }

  return res.status(500).json({ success: false, message: "Internal server error." });
});

export default app;
