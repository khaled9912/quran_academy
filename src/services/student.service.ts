import { backendFetch } from "@/lib/backend-client";
import type { Student } from "@/types/student";

export interface CreateStudentInput {
  fullName: string;
  email: string;
  password: string;
  grade?: string;
}

export const getStudents = (includeInactive = false) =>
  backendFetch<Student[]>(
    `/api/students${includeInactive ? "?includeInactive=true" : ""}`
  );

/** Admin-only: provisions a student account through the backend. */
export const createStudent = (input: CreateStudentInput) =>
  backendFetch<Student>("/api/students", {
    method: "POST",
    body: JSON.stringify(input),
  });
