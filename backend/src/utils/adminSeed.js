export class AdminSeedError extends Error {}

export async function seedAdminAccount({ userModel, hashPassword, email, password }) {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!normalizedEmail || typeof password !== "string" || password.length < 12) {
    throw new AdminSeedError("Admin seed email and a password of at least 12 characters are required.");
  }

  if (await userModel.exists({ role: "admin" })) {
    throw new AdminSeedError("An admin account already exists; no account was changed.");
  }

  if (await userModel.exists({ email: normalizedEmail })) {
    throw new AdminSeedError("The seed email already belongs to an account; no account was changed.");
  }

  const username = normalizedEmail.split("@")[0];
  if (await userModel.exists({ username })) {
    throw new AdminSeedError("The seed username is already in use; no account was changed.");
  }

  const passwordHash = await hashPassword(password);
  return userModel.create({
    username,
    email: normalizedEmail,
    password: passwordHash,
    role: "admin",
  });
}
