import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create(
  persist(
    (set) => ({
      clerkUser: null,
      dbUser: null,
      isOnboarded: false,
      setClerkUser: (user) => set({ clerkUser: user }),
      setDbUser: (user) => set({ dbUser: user }),
      setOnboarded: (bool) => set({ isOnboarded: bool }),
      reset: () => set({ clerkUser: null, dbUser: null }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ isOnboarded: state.isOnboarded }),
    }
  )
);