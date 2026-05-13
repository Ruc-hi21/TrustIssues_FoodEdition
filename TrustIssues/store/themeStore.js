import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "dark",
      isDark: true,
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        set({ theme: next, isDark: next === "dark" });
      },
      setTheme: (t) => set({ theme: t, isDark: t === "dark" }),
    }),
    { name: "theme-store", storage: createJSONStorage(() => AsyncStorage) }
  )
);