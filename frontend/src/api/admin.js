import api from "./client.js";

export async function getAdminStats() {
  const { data } = await api.get("/api/admin/stats");
  return data.data;
}

export async function getAdminUsers(page = 1, limit = 20, filters = {}) {
  const params = { page, limit };
  for (const [key, value] of Object.entries(filters)) {
    if (value) params[key] = value;
  }
  const { data } = await api.get("/api/admin/users", { params });
  return data;
}

export async function changeUserRole(id, role) {
  const { data } = await api.patch(`/api/admin/users/${id}/role`, { role });
  return data.data;
}

export async function setUserStatus(id, status) {
  const { data } = await api.patch(`/api/admin/users/${id}/status`, { status });
  return data.data;
}

export async function deleteUser(id) {
  const { data } = await api.delete(`/api/admin/users/${id}`);
  return data;
}
