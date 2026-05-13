import { apiFetch } from "./api";

export const petService = {
  getPets: () => apiFetch("/api/pets"),
  addPet: (data) =>
    apiFetch("/api/pets", { method: "POST", body: JSON.stringify(data) }),
  updatePet: (id, data) =>
    apiFetch(`/api/pets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePet: (id) => apiFetch(`/api/pets/${id}`, { method: "DELETE" }),

  getPetAllergens: (petId) => apiFetch(`/api/pets/${petId}/allergens`),
  addPetAllergen: (petId, allergen, severity) =>
    apiFetch(`/api/pets/${petId}/allergens`, {
      method: "POST",
      body: JSON.stringify({ allergen, severity }),
    }),
  deletePetAllergen: (petId, id) =>
    apiFetch(`/api/pets/${petId}/allergens/${id}`, { method: "DELETE" }),

  getPetHazards: (petId) => apiFetch(`/api/pets/${petId}/hazards`),
  addPetHazard: (petId, ingredient, notes) =>
    apiFetch(`/api/pets/${petId}/hazards`, {
      method: "POST",
      body: JSON.stringify({ ingredient, notes }),
    }),
  deletePetHazard: (petId, id) =>
    apiFetch(`/api/pets/${petId}/hazards/${id}`, { method: "DELETE" }),
};