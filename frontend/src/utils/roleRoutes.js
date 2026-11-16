export function getRoleHomePath(user) {
  return user?.role === "admin" ? "/admin" : "/user";
}
