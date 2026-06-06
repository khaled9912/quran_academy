import { create } from "zustand";
import { UserProfile } from "@/types/user";

interface AuthState {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
