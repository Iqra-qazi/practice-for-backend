import api from "./client.js";

export async function register(credentials) {
  const { data } = await api.post("/api/auth/register", credentials);
  return data;
}

export async function login(credentials) {
  const { data } = await api.post("/api/auth/login", credentials);
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get("/api/auth/me");
  return data;
}

export async function logout() {
  await api.post("/api/auth/logout");
}
