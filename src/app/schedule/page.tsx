"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Clock3,
  MessageSquareQuote,
  RefreshCw,
  Video,
} from "lucide-react";
import { getLessons } from "@/services/lesson.service";
import { useAuth } from "@/providers/auth-provider";
import { isLessonEnded } from "@/lib/lesson-feedback";
import type { Lesson } from "@/types/lesson";

type Filter = "all" | "upcoming" | "completed" | "cancelled";

const dayLabel = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const timeLabel = (value: string) =>
  new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

const statusStyles: Record<Lesson["status"], string> = {
  scheduled: "bg-green-100 text-green-800",
  in_progress: "bg-sky-100 text-sky-800",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function StudentSchedulePage() {
  const { role } = useAuth();
  const [filter, setFilter] = useState<Filter>("upcoming");
  const lessonsQuery = useQuery({
    queryKey: ["lessons"],
    queryFn: () => getLessons(),
    enabled: role === "student",
  });

  const lessons = lessonsQuery.data ?? [];
  const now = Date.now();

  const visible = useMemo(() => {
    const filtered = lessons.filter((lesson) => {
      if (filter === "all") return true;
      if (filter === "upcoming") {
        return (
          lesson.status !== "cancelled" &&
          lesson.status !== "completed" &&
          new Date(lesson.startsAt).getTime() >= now
        );
      }
      return lesson.status === filter;
    });
    return filtered.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }, [lessons, filter, now]);

  const groups = useMemo(() => {
    const byDay = new Map<string, Lesson[]>();
    for (const lesson of visible) {
      const key = new Date(lesson.startsAt).toDateString();
      byDay.set(key, [...(byDay.get(key) ?? []), lesson]);
    }
    return [...byDay.entries()];
  }, [visible]);

  if (role !== "student") {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        This schedule is available to students. Use your role dashboard instead.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="mx-auto max-w-5xl px-4 md:px-8 lg:px-16">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/student/dashboard"
              className="text-green-600 hover:text-green-700 mb-3 inline-block"
            >
              ← Back to dashboard
            </Link>
            <h1 className="text-4xl font-bold mb-2">My schedule</h1>
            <p className="text-lg text-foreground opacity-75">
              Every lesson confirmed for you by your teacher and the academy.
            </p>
          </div>
          <button
            onClick={() => void lessonsQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold hover:border-green-500"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {(["upcoming", "all", "completed", "cancelled"] as Filter[]).map(
            (option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                  filter === option
                    ? "bg-green-500 text-white"
                    : "border border-card-border text-foreground hover:border-green-500"
                }`}
              >
                {option}
              </button>
            )
          )}
        </div>

        {lessonsQuery.error && (
          <p
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {lessonsQuery.error instanceof Error
              ? lessonsQuery.error.message
              : "Unable to load your schedule."}
          </p>
        )}

        {lessonsQuery.isLoading ? (
          <p className="text-foreground opacity-70">Loading your schedule…</p>
        ) : groups.length ? (
          <div className="space-y-8">
            {groups.map(([day, lessonsForDay]) => (
              <section key={day}>
                <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
                  <CalendarDays size={18} className="text-green-600" />
                  {dayLabel(lessonsForDay[0].startsAt)}
                </h2>
                <div className="space-y-3">
                  {lessonsForDay.map((lesson) => (
                    <article
                      key={lesson.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-card-border bg-card-bg p-5"
                    >
                      <div>
                        <p className="font-semibold">
                          {timeLabel(lesson.startsAt)} –{" "}
                          {timeLabel(lesson.endsAt)}
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm text-foreground opacity-70">
                          <Clock3 size={15} />
                          {dayLabel(lesson.startsAt)}
                        </p>
                        <p className="mt-1 text-sm text-foreground opacity-70">
                          Teacher: {lesson.teacherName ?? "Assigned teacher"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[lesson.status]}`}
                        >
                          {lesson.status.replaceAll("_", " ")}
                        </span>
                        {(lesson.status === "scheduled" ||
                          lesson.status === "in_progress") &&
                          !isLessonEnded(lesson.endsAt, lesson.status) && (
                            <Link
                              href={`/lesson/${lesson.id}`}
                              className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
                            >
                              <Video size={15} /> Attend lesson
                            </Link>
                          )}
                        {lesson.status !== "cancelled" &&
                          isLessonEnded(lesson.endsAt, lesson.status) && (
                            <Link
                              href={`/lesson/${lesson.id}`}
                              className="inline-flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm font-semibold transition hover:border-green-500"
                            >
                              <MessageSquareQuote size={15} />
                              {lesson.review
                                ? "View feedback"
                                : "Feedback & review"}
                            </Link>
                          )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-card-border bg-card-bg p-10 text-center text-foreground opacity-70">
            {filter === "upcoming" ? (
              <>
                No upcoming lessons.{" "}
                <Link
                  href="/student/availability"
                  className="font-semibold text-green-600 hover:underline"
                >
                  Choose an available time
                </Link>
                .
              </>
            ) : (
              "No lessons match this filter."
            )}
          </div>
        )}
      </div>
    </main>
  );
}
