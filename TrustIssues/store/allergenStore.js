import { create } from "zustand";

export const useAllergenStore = create((set) => ({
  allergens: [],
  pets: [],
  setAllergens: (arr) => set({ allergens: arr }),
  setPets: (arr) => set({ pets: arr }),
  addAllergen: (item) =>
    set((state) => ({ allergens: [...state.allergens, item] })),
  removeAllergen: (id) =>
    set((state) => ({ allergens: state.allergens.filter((a) => a.id !== id) })),
  addPet: (pet) => set((state) => ({ pets: [...state.pets, pet] })),
  removePet: (id) =>
    set((state) => ({ pets: state.pets.filter((p) => p.id !== id) })),
  updatePet: (id, data) =>
    set((state) => ({
      pets: state.pets.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),
}));