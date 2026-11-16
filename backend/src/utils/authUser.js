export function serializeAuthUser(user) {
  const value = typeof user.toObject === "function" ? user.toObject() : user;

  return {
    id: String(value._id ?? value.id),
    name: value.username ?? value.name ?? "",
    email: value.email,
    role: value.role ?? "user",
    picture: value.picture ?? null,
  };
}

export function serializeAuthResponse(user) {
  return {
    success: true,
    user: serializeAuthUser(user),
  };
}
