import { apiFetch } from "./api";

export const scanService = {
  scanCamera: (body) =>
    apiFetch("/api/scan/camera", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getHistory: (page = 1, limit = 20) =>
    apiFetch(`/api/scan/history?page=${page}&limit=${limit}`),
  getScan: (scanId) => apiFetch(`/api/scan/${scanId}`),
  deleteScan: (scanId) => apiFetch(`/api/scan/${scanId}`, { method: "DELETE" }),
};