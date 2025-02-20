import { create } from "zustand";

interface authStore {
  token: string | null;
  setToken: (token: string | null) => void;
  clearToken: () => void;
}

export const useAuthStore = create<authStore>((set) => ({
  token: localStorage.getItem("token") || null,
  setToken: (token) => set({ token }),
  clearToken: () => set({ token: null }),
}));
