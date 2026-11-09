"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { Lesson } from "@/types/lesson";

const when = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

/**
 * The lessons after today, so a dashboard that leads with today still answers
 * "when am I next" without turning into the full schedule. The section hosting
 * it already links to that schedule.
 */
export function NextUpLessons({
  lessons,
  perspective,
}: {
  lessons: Lesson[];
  perspective: "student" | "teacher";
}) {
  if (!lessons.length) return null;

  return (
    <div className="mt-6 rounded-2xl border border-card-border p-5">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground opacity-70">
        <CalendarDays
          size={15}
          className="text-green-600 dark:text-green-400"
        />
        Next up
      </h3>
      <ul className="divide-y divide-card-border">
        {lessons.map((lesson) => (
          <li
            key={lesson.id}
            className="flex flex-wrap items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <Link
              href={`/lesson/${lesson.id}`}
              className="font-semibold hover:text-green-600 dark:hover:text-green-400"
            >
              {when(lesson.startsAt)}
            </Link>
            <span className="text-sm text-foreground opacity-70">
              {perspective === "student"
                ? `Teacher: ${lesson.teacherName ?? "Assigned teacher"}`
                : `Student: ${lesson.studentName ?? "Assigned student"}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
