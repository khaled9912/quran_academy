import { backendFetch } from "@/lib/backend-client";
import type { FlaggedLesson, LessonTranscript } from "@/types/transcript";

export const getFlaggedLessons = () =>
  backendFetch<FlaggedLesson[]>("/api/admin/transcripts");

export const getLessonTranscript = (lessonId: string) =>
  backendFetch<LessonTranscript>(
    `/api/admin/lessons/${encodeURIComponent(lessonId)}/transcript`
  );
