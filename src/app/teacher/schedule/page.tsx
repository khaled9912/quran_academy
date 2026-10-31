"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, RefreshCw } from "lucide-react";
import { cancelLesson, getLessons } from "@/services/lesson.service";
import { useAuth } from "@/providers/auth-provider";
import { isLessonEnded } from "@/lib/lesson-feedback";
import type { Lesson } from "@/types/lesson";

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

export default function TeacherSchedulePage() {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const lessonsQuery = useQuery({
    queryKey: ["lessons"],
    queryFn: () => getLessons(),
    enabled: role === "teacher",
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelLesson(id),
    onSuccess: async () => {
      setNotice(
        "Lesson cancelled. The student has been removed from this time."
      );
      await queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to cancel this lesson."
      );
    },
  });

  const groups = useMemo(() => {
    const byDay = new Map<string, Lesson[]>();
    for (const lesson of [...(lessonsQuery.data ?? [])].sort((a, b) =>
      a.startsAt.localeCompare(b.startsAt)
    )) {
      const key = new Date(lesson.startsAt).toDateString();
      byDay.set(key, [...(byDay.get(key) ?? []), lesson]);
    }
    return [...byDay.entries()];
  }, [lessonsQuery.data]);

  if (role !== "teacher") {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        This schedule is available to teachers.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="mx-auto max-w-5xl px-4 md:px-8 lg:px-16">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/teacher/dashboard"
              className="text-green-600 hover:text-green-700 mb-3 inline-block"
            >
              ← Back to dashboard
            </Link>
            <h1 className="text-4xl font-bold mb-2">Teaching schedule</h1>
            <p className="text-lg text-foreground opacity-75">
              Confirmed lessons appear here. Publish new times from your
              availability page.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/teacher/availability"
              className="rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600"
            >
              Publish availability
            </Link>
            <button
              onClick={() => void lessonsQuery.refetch()}
              className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold hover:border-green-500"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {notice}
          </p>
        )}

        {lessonsQuery.isLoading ? (
          <p className="text-foreground opacity-70">Loading your lessons…</p>
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
                        <p className="mt-1 text-sm text-foreground opacity-70">
                          Student: {lesson.studentName ?? "Assigned student"}
                        </p>
                        <p className="mt-1 text-xs capitalize text-foreground opacity-60">
                          {lesson.status.replaceAll("_", " ")}
                        </p>
                        {lesson.status !== "cancelled" &&
                          isLessonEnded(lesson.endsAt, lesson.status) && (
                            <p
                              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                lesson.report
                                  ? "bg-green-100 text-green-800"
                                  : "bg-amber-100 text-amber-900"
                              }`}
                            >
                              {lesson.report
                                ? "Report submitted"
                                : "Report required"}
                            </p>
                          )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {(lesson.status === "scheduled" ||
                          lesson.status === "in_progress") &&
                          !isLessonEnded(lesson.endsAt, lesson.status) && (
                          <Link
                            href={`/lesson/${lesson.id}`}
                            className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
                          >
                            Join lesson
                          </Link>
                        )}
                        {lesson.status !== "cancelled" &&
                          isLessonEnded(lesson.endsAt, lesson.status) &&
                          (lesson.report ? (
                            <Link
                              href={`/lesson/${lesson.id}`}
                              className="rounded-xl border border-card-border px-4 py-2 text-sm font-semibold transition hover:border-green-500"
                            >
                              View report
                            </Link>
                          ) : (
                            <Link
                              href={`/lesson/${lesson.id}`}
                              className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
                            >
                              Write report
                            </Link>
                          ))}
                        {lesson.status === "scheduled" && (
                          <button
                            onClick={() => {
                              setError("");
                              setNotice("");
                              if (
                                window.confirm(
                                  "Cancel this lesson? This cannot be undone."
                                )
                              ) {
                                cancelMutation.mutate(lesson.id);
                              }
                            }}
                            disabled={cancelMutation.isPending}
                            className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                          >
                            {cancelMutation.isPending
                              ? "Cancelling…"
                              : "Cancel lesson"}
                          </button>
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
            No confirmed lessons yet. Publish availability so your students can
            request a time.
          </div>
        )}
      </div>
    </main>
  );
}
