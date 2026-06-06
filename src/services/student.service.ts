import { backendFetch } from "@/lib/backend-client";
import type { Student } from "@/types/student";

export const getStudents = async (): Promise<Student[]> => {
  return backendFetch("/api/students");
};

export const getStudentById = async (id: string): Promise<Student> => {
  return backendFetch(`/api/students/${id}`);
};
