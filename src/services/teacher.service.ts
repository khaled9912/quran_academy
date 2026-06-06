import { backendFetch } from "@/lib/backend-client";
import type { Teacher } from "@/types/teacher";

export const getTeachers = async (): Promise<Teacher[]> => {
  return backendFetch("/api/teachers");
};

export const getTeacherById = async (id: string): Promise<Teacher> => {
  return backendFetch(`/api/teachers/${id}`);
};
