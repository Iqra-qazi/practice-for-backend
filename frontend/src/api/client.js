import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url ?? "";
    const isAuthSubmission = /\/auth\/(login|register|google)$/.test(requestUrl);
    if (error.response?.status === 401 && !isAuthSubmission) {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(error);
  },
);

export function getApiError(error, fallback = "Something went wrong. Please try again.") {
  return error.response?.data?.message || fallback;
}

export default api;
