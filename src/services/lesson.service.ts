import { backendFetch } from "@/lib/backend-client";
import type { Lesson } from "@/types/lesson";
export const getLessons = (query = "") => backendFetch<Lesson[]>(`/api/lessons${query ? `?${query}` : ""}`);
export const getLessonById = (id: string) => backendFetch<Lesson>(`/api/lessons/${encodeURIComponent(id)}`);
export const updateLesson = (id: string, input: Partial<Pick<Lesson, "startsAt" | "endsAt" | "status">>) => backendFetch<Lesson>(`/api/lessons/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(input) });
export const cancelLesson = (id: string) => backendFetch<null>(`/api/lessons/${encodeURIComponent(id)}`, { method: "DELETE" });
