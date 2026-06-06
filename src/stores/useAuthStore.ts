import { create } from "zustand";

export type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  role: "admin" | "teacher" | "student" | "parent" | string;
  avatar_url?: string;
};

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
