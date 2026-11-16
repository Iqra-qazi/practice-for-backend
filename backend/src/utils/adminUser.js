export function serializeAdminUser(user) {
  const value = typeof user.toObject === "function" ? user.toObject() : user;
  const serialized = {
    _id: String(value._id),
    username: value.username,
    email: value.email,
    role: value.role,
    status: value.status ?? "active",
  };

  if (value.createdAt) serialized.createdAt = value.createdAt;
  if (value.updatedAt) serialized.updatedAt = value.updatedAt;
  return serialized;
}
