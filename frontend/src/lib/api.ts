import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Attach JWT token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("voyageai_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authAPI = {
  register: (data: { email: string; name: string; password: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

// ─── Trips ───────────────────────────────────────────────────────────────────

export const tripsAPI = {
  generate: (data: {
    prompt: string;
    budget_tier?: string;
    num_people?: number;
    duration_days?: number;
  }) => api.post("/trips/generate", data),
  list: () => api.get("/trips"),
  get: (id: string) => api.get(`/trips/${id}`),
};

// ─── Chat ────────────────────────────────────────────────────────────────────

export const chatAPI = {
  send: (message: string, session_id?: string) =>
    api.post("/chat", { message, session_id }),
};

// ─── Destinations ────────────────────────────────────────────────────────────

export const destinationsAPI = {
  list: () => api.get("/destinations"),
};
