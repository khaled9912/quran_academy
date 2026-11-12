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
import { isLessonJoinable, isLessonLive } from "@/lib/lesson-feedback";
import { useNow } from "@/hooks/use-now";
import { LiveNowBadge } from "@/components/LiveNowBadge";
import {
  cancelledLessons,
  COMPLETED_PAGE_SIZE,
  countCompletedLessons,
  LESSON_WINDOW_DAYS,
  pastLessons,
  upcomingDayPage,
  upcomingLessons,
} from "@/lib/lesson-window";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";
import type { Lesson } from "@/types/lesson";

type Filter = "upcoming" | "past" | "cancelled";

const filterOptions: { value: Filter; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "cancelled", label: "Cancelled" },
];

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
    hour12: true,
  });

const statusStyles: Record<Lesson["status"], string> = {
  scheduled:
    "bg-green-100 dark:bg-green-500/15 text-green-800 dark:text-green-300",
  in_progress: "bg-sky-100 dark:bg-sky-500/15 text-sky-800 dark:text-sky-300",
  completed: "bg-gray-100 dark:bg-gray-500/15 text-gray-700 dark:text-gray-300",
  cancelled: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300",
};

const cancellationLabels: Record<string, string> = {
  free_cancellation: "Free cancellation",
  grace_cancellation: "Grace cancellation",
  late_cancellation: "Late cancellation",
  cancelled_by_teacher: "Teacher cancelled",
  late_cancelled_by_teacher: "Teacher late cancel",
  admin_cancelled: "Academy cancelled",
  student_no_show: "No-show recorded",
  teacher_no_show: "Teacher no-show",
  both_absent: "Both absent",
  series_ended: "Weekly lessons ended",
  series_rescheduled: "Weekly time changed",
};

export default function StudentSchedulePage() {
  const { role } = useAuth();
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [completedLimit, setCompletedLimit] = useState(COMPLETED_PAGE_SIZE);
  const [upcomingDays, setUpcomingDays] = useState(1);
  const lessonsQuery = useQuery({
    queryKey: ["lessons"],
    queryFn: () => getLessons(),
    enabled: role === "student",
    refetchInterval: LIVE_SYNC_INTERVAL,
  });

  const lessons = lessonsQuery.data ?? [];
  const now = useNow();
  const upcomingPage = useMemo(
    () => upcomingDayPage(lessons, upcomingDays, now),
    [lessons, now, upcomingDays]
  );

  const visible = useMemo(() => {
    if (filter === "upcoming") return upcomingPage.lessons;
    if (filter === "cancelled") return cancelledLessons(lessons, now);
    return pastLessons(lessons, {
      now,
      windowDays: LESSON_WINDOW_DAYS,
      completedLimit,
    });
  }, [completedLimit, filter, lessons, now, upcomingPage]);

  const hasMoreCompleted =
    filter === "past" && countCompletedLessons(lessons) > completedLimit;
  const hasMoreUpcoming = filter === "upcoming" && upcomingPage.hasMore;
  const nextDayLabel = upcomingPage.nextDay
    ? new Date(upcomingPage.nextDay).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : null;

  // Offer "change time" once per weekly series, on its next lesson.
  const firstOfSeries = useMemo(() => {
    const seen = new Map<string, string>();
    for (const lesson of upcomingLessons(lessons, now)) {
      if (lesson.seriesId && !seen.has(lesson.seriesId)) {
        seen.set(lesson.seriesId, lesson.id);
      }
    }
    return seen;
  }, [lessons, now]);

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
              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-400 mb-3 inline-block"
            >
              ← Back to dashboard
            </Link>
            <h1 className="text-4xl font-bold mb-2">My schedule</h1>
            <p className="text-lg text-foreground opacity-75">
              Your weekly lessons and their lesson rooms.
            </p>
          </div>
          <button
            onClick={() => void lessonsQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold hover:border-green-500"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <div className="mb-2 flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              aria-pressed={filter === option.value}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                filter === option.value
                  ? "bg-green-500 text-white"
                  : "border border-card-border text-foreground hover:border-green-500"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="mb-6 text-sm text-foreground opacity-60">
          {filter === "upcoming"
            ? "Showing one lesson day at a time."
            : filter === "past"
              ? "Showing the last 7 days · completed lessons load four at a time."
              : "Showing cancelled lessons within one week of today."}
        </p>

        {lessonsQuery.error && (
          <p
            role="alert"
            className="mb-6 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
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
                  <CalendarDays
                    size={18}
                    className="text-green-600 dark:text-green-400"
                  />
                  {dayLabel(lessonsForDay[0].startsAt)}
                </h2>
                <div className="space-y-3">
                  {lessonsForDay.map((lesson) => {
                    const live = isLessonLive(
                      lesson.startsAt,
                      lesson.endsAt,
                      lesson.status,
                      now
                    );
                    return (
                      <article
                        key={lesson.id}
                        className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card-bg p-5 ${
                          live ? "border-green-400" : "border-card-border"
                        }`}
                      >
                        <div>
                          <p className="flex flex-wrap items-center gap-2 font-semibold">
                            {timeLabel(lesson.startsAt)} –{" "}
                            {timeLabel(lesson.endsAt)}
                            {live && <LiveNowBadge />}
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
                          <span className="flex flex-wrap justify-end gap-2">
                            {lesson.isTrial && (
                              <span className="rounded-full bg-sky-100 dark:bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-800 dark:text-sky-300">
                                Trial
                              </span>
                            )}
                            {lesson.isMakeup && (
                              <span className="rounded-full bg-green-100 dark:bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-800 dark:text-green-300">
                                Make-up
                              </span>
                            )}
                            {lesson.status === "cancelled" &&
                            lesson.cancellationOutcome ? (
                              <span className="rounded-full bg-red-100 dark:bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">
                                {cancellationLabels[
                                  lesson.cancellationOutcome
                                ] ?? "Cancelled"}
                              </span>
                            ) : (
                              !live && (
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[lesson.status]}`}
                                >
                                  {lesson.status.replaceAll("_", " ")}
                                </span>
                              )
                            )}
                          </span>
                          {isLessonJoinable(
                            lesson.endsAt,
                            lesson.status,
                            now
                          ) && (
                            <Link
                              href={`/lesson/${lesson.id}`}
                              className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
                            >
                              <Video size={15} /> Attend lesson
                            </Link>
                          )}
                          {lesson.seriesId &&
                            firstOfSeries.get(lesson.seriesId) ===
                              lesson.id && (
                              <Link
                                href={`/student/change-time/${lesson.seriesId}`}
                                className="inline-flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm font-semibold transition hover:border-green-500"
                              >
                                Change weekly time
                              </Link>
                            )}
                          {lesson.status !== "cancelled" &&
                            !isLessonJoinable(
                              lesson.endsAt,
                              lesson.status,
                              now
                            ) && (
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
                    );
                  })}
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
                  href="/student/dashboard"
                  className="font-semibold text-green-600 dark:text-green-400 hover:underline"
                >
                  See your dashboard
                </Link>
                .
              </>
            ) : filter === "past" ? (
              "No lessons in the last 7 days."
            ) : (
              "No cancelled lessons within one week of today."
            )}
          </div>
        )}

        {!lessonsQuery.isLoading && hasMoreUpcoming && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setUpcomingDays((value) => value + 1)}
              className="rounded-xl border border-card-border bg-card-bg px-5 py-2.5 text-sm font-semibold transition hover:border-green-500"
            >
              Load more{nextDayLabel ? ` · ${nextDayLabel}` : ""}
            </button>
          </div>
        )}

        {!lessonsQuery.isLoading && hasMoreCompleted && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() =>
                setCompletedLimit((value) => value + COMPLETED_PAGE_SIZE)
              }
              className="rounded-xl border border-card-border bg-card-bg px-5 py-2.5 text-sm font-semibold transition hover:border-green-500"
            >
              Load more completed lessons
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
