import { apiFetch } from "./api";

export const userService = {
  getProfile: () => apiFetch("/api/user/profile"),
  updateProfile: (data) =>
    apiFetch("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getAllergens: () => apiFetch("/api/user/allergens"),
  addAllergen: (allergen, severity) =>
    apiFetch("/api/user/allergens", {
      method: "POST",
      body: JSON.stringify({ allergen, severity }),
    }),
  deleteAllergen: (id) =>
    apiFetch(`/api/user/allergens/${id}`, { method: "DELETE" }),
};