import "dotenv/config";
import app from "../src/app.js";
import connectDB from "../src/db/db.js";
import { validateServerEnvironment } from "../src/config/environment.js";

validateServerEnvironment();

export default async function handler(req, res) {
  const requestUrl = new URL(req.url, "https://vercel.invalid");
  const routedPath = requestUrl.searchParams.get("__vercel_path");
  let path = requestUrl.pathname;

  if (routedPath !== null) {
    const normalizedPath = routedPath.replace(/^\/+/, "");
    if (
      !normalizedPath
      || normalizedPath.includes("\\")
      || normalizedPath.split("/").some((segment) => segment === "." || segment === "..")
    ) {
      return res.status(400).json({ success: false, message: "Invalid request path." });
    }

    path = `/api/${normalizedPath}`;
    requestUrl.searchParams.delete("__vercel_path");
    req.url = `${path}${requestUrl.search}`;
  }

  const origin = req.headers.origin;
  if (req.method === "OPTIONS" || (origin && origin !== process.env.CLIENT_URL)) {
    return app(req, res);
  }

  const needsDatabase =
    (path.startsWith("/api/auth/") && path !== "/api/auth/logout")
    || path.startsWith("/api/admin/");

  if (needsDatabase) {
    try {
      await connectDB();
    } catch {
      return res.status(503).json({
        success: false,
        message: "Service temporarily unavailable.",
      });
    }
  }

  return app(req, res);
}
