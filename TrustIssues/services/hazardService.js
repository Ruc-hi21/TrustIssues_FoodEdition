import { apiFetch } from "./api";

export const hazardService = {
  search: (query) =>
    apiFetch(`/api/hazards?search=${encodeURIComponent(query)}`),
};