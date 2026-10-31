import type { LessonProgress } from "@/types/lesson";

export const progressLabels: Record<LessonProgress, string> = {
  excellent: "Excellent progress",
  good: "Good progress",
  needs_attention: "Needs attention",
};

export const progressClasses: Record<LessonProgress, string> = {
  excellent: "bg-green-100 text-green-800",
  good: "bg-sky-100 text-sky-800",
  needs_attention: "bg-amber-100 text-amber-900",
};

export const lessonDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const isLessonEnded = (endsAt: string, status: string) =>
  status === "completed" || new Date(endsAt).getTime() <= Date.now();
