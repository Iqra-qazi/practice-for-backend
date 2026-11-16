import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import userModel from "../models/users.model.js";
import { setAuthCookie, signAuthToken } from "../utils/jwt.js";
import { serializeAuthResponse } from "../utils/authUser.js";

const googleClient = new OAuth2Client();

function createUsernameBase(name, email) {
  const candidate = typeof name === "string" ? name.trim() : "";
  return candidate || email.split("@")[0];
}

async function uniqueUsername(base) {
  let username = base;
  while (await userModel.exists({ username })) {
    username = `${base}-${randomBytes(4).toString("hex")}`;
  }
  return username;
}

export async function googleAuth(req, res) {
  const credential = req.body?.credential;
  if (typeof credential !== "string" || !credential.trim()) {
    return res.status(400).json({ message: "Google credential is required." });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ message: "Google authentication is not configured." });
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ message: "Invalid Google credential." });
  }

  const email = payload?.email?.trim().toLowerCase();
  if (!email || payload.email_verified !== true) {
    return res.status(401).json({ message: "A verified Google email is required." });
  }

  try {
    let user = await userModel.findOne({ email });

    if (!user) {
      const username = await uniqueUsername(createUsernameBase(payload.name, email));
      const generatedPassword = randomBytes(32).toString("hex");
      const password = await bcrypt.hash(generatedPassword, 10);
      user = await userModel.create({
        username,
        email,
        password,
        picture: payload.picture ?? null,
      });
    } else if (payload.picture && user.picture !== payload.picture) {
      user.picture = payload.picture;
      await user.save();
    }

    if ((user.status ?? "active") === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked",
      });
    }

    const token = signAuthToken(user);
    setAuthCookie(res, token);
    return res.status(200).json(serializeAuthResponse(user));
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}
