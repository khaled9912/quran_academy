import { backendFetch } from "@/lib/backend-client";
import type { Teacher } from "@/types/teacher";

export interface CreateTeacherInput {
  fullName: string;
  email: string;
  password: string;
}

export const getTeachers = (includeInactive = false) =>
  backendFetch<Teacher[]>(`/api/teachers${includeInactive ? "?includeInactive=true" : ""}`);

export const getTeacherById = (id: string) =>
  backendFetch<Teacher>(`/api/teachers/${encodeURIComponent(id)}`);

export const createTeacher = async (input: CreateTeacherInput): Promise<Teacher> => {
  const { user } = await backendFetch<{ user: Teacher }>("/api/admin/users", {
    method: "POST",
    body: JSON.stringify({ ...input, role: "teacher" }),
  });
  return user;
};
