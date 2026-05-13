import { apiFetch } from "./api";

export const authService = {
  syncUser: (name, email) =>
    apiFetch("/api/auth/sync", {
      method: "POST",
      body: JSON.stringify({ name, email }),
    }),
};