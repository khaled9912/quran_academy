import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  selectedStudentId?: string;
  theme: "light" | "dark";
  setSidebarOpen: (open: boolean) => void;
  setSelectedStudentId: (id?: string) => void;
  toggleTheme: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  theme: "light",
  selectedStudentId: undefined,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSelectedStudentId: (selectedStudentId) => set({ selectedStudentId }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
}));
