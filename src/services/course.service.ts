import { backendFetch } from "@/lib/backend-client";
import type { Course } from "@/types/course";

export const getCourses = async (): Promise<Course[]> => {
  return backendFetch("/api/courses");
};

export const getCourseById = async (id: string): Promise<Course> => {
  return backendFetch(`/api/courses/${id}`);
};
