import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useScanStore = create(
  persist(
    (set) => ({
      recentScans: [],
      addScan: (scan) =>
        set((state) => {
          const filtered = state.recentScans.filter(
            (s) => s.scanId !== scan.scanId
          );
          return { recentScans: [scan, ...filtered].slice(0, 10) };
        }),
      clearAll: () => set({ recentScans: [] }),
    }),
    { name: "scan-store", storage: createJSONStorage(() => AsyncStorage) }
  )
);