import jwt from "jsonwebtoken";

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET must be configured.");
  }
  return secret;
}

export function signAuthToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    getJwtSecret(),
  );
}

export function setAuthCookie(res, token) {
  res.cookie("token", token, getAuthCookieOptions());
}

export function clearAuthCookie(res) {
  res.clearCookie("token", getAuthCookieOptions());
}

export function getAuthCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
}
