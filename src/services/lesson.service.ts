import { backendFetch } from "@/lib/backend-client";
import type {
  Lesson,
  LessonProgress,
  LessonReport,
  TeacherReview,
} from "@/types/lesson";
export const getLessons = (query = "") =>
  backendFetch<Lesson[]>(`/api/lessons${query ? `?${query}` : ""}`);
export const getLessonById = (id: string) =>
  backendFetch<Lesson>(`/api/lessons/${encodeURIComponent(id)}`);
export const updateLesson = (
  id: string,
  input: Partial<Pick<Lesson, "startsAt" | "endsAt" | "status">>
) =>
  backendFetch<Lesson>(`/api/lessons/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
export const cancelLesson = (id: string) =>
  backendFetch<null>(`/api/lessons/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

export const getLessonReport = (id: string) =>
  backendFetch<LessonReport>(`/api/lessons/${encodeURIComponent(id)}/report`);
export const saveLessonReport = (
  id: string,
  input: {
    classSummary: string;
    studentFeedback: string;
    progress: LessonProgress;
  }
) =>
  backendFetch<LessonReport>(`/api/lessons/${encodeURIComponent(id)}/report`, {
    method: "POST",
    body: JSON.stringify(input),
  });

export const getLessonReview = (id: string) =>
  backendFetch<TeacherReview>(`/api/lessons/${encodeURIComponent(id)}/review`);
export const saveLessonReview = (
  id: string,
  input: { rating: number; comment?: string }
) =>
  backendFetch<TeacherReview>(`/api/lessons/${encodeURIComponent(id)}/review`, {
    method: "POST",
    body: JSON.stringify(input),
  });
