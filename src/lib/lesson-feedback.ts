import type { Lesson, LessonProgress } from "@/types/lesson";

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
    hour12: true,
  });

export const isLessonEnded = (endsAt: string, status: string) =>
  status === "completed" || new Date(endsAt).getTime() <= Date.now();

/**
 * A lesson stays on the schedule with a join action until its scheduled end,
 * even if it already started or was marked ended early. Either side can rejoin
 * after a dropped call. The room itself still opens no earlier than the start.
 */
export const isLessonJoinable = (
  endsAt: string,
  status: string,
  now = Date.now()
) => status !== "cancelled" && new Date(endsAt).getTime() > now;

/** Inside the scheduled window, regardless of what the stored status says. */
export const isLessonLive = (
  startsAt: string,
  endsAt: string,
  status: string,
  now = Date.now()
) =>
  status !== "cancelled" &&
  new Date(startsAt).getTime() <= now &&
  new Date(endsAt).getTime() > now;

export const isReportDue = (lesson: Lesson) =>
  lesson.status !== "cancelled" &&
  isLessonEnded(lesson.endsAt, lesson.status) &&
  !lesson.report;

export const isReportSubmitted = (lesson: Lesson) =>
  lesson.status !== "cancelled" &&
  isLessonEnded(lesson.endsAt, lesson.status) &&
  Boolean(lesson.report);
