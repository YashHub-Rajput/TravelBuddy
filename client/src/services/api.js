// File: client/src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("tb_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// Normalise all responses: unwrap .data on success, surface message on error
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    // No response at all = server is down / CORS / network issue
    if (!err.response) {
      return Promise.reject({
        message: "Cannot reach the server. Make sure the backend is running on port 5000.",
      });
    }

    // 401 on protected routes only – don't redirect on login/register failures
    const isAuthRoute =
      err.config?.url?.includes("/auth/login") ||
      err.config?.url?.includes("/auth/register");

    if (err.response.status === 401 && !isAuthRoute) {
      localStorage.removeItem("tb_token");
      window.location.href = "/login";
    }

    // Surface the server's error message when available
    const message =
      err.response.data?.message ||
      err.response.data?.errors?.[0]?.message ||
      "Something went wrong. Please try again.";

    return Promise.reject({ message, status: err.response.status });
  }
);

export default api;
