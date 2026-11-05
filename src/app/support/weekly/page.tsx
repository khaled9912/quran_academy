"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { getWeeklyDigest } from "@/services/review.service";
import type { TeacherDigest } from "@/types/review";

const dateOnly = (value: Date) =>
  `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}-${String(value.getUTCDate()).padStart(2, "0")}`;

const currentMonday = () => {
  const today = new Date();
  const monday = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  );
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  return dateOnly(monday);
};

const shiftWeek = (weekStart: string, days: number) => {
  const date = new Date(`${weekStart}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return dateOnly(date);
};

const formatWeek = (weekStart: string, weekEnd: string) => {
  const start = new Date(`${weekStart}T00:00:00Z`).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric", timeZone: "UTC" }
  );
  const end = new Date(`${weekEnd}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${start} – ${end}`;
};

const display = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const score = (label: string, value: number | null) => (
  <div className="rounded-xl border border-card-border px-3 py-2 text-center">
    <p className="text-[11px] uppercase tracking-wide opacity-60">{label}</p>
    <p className="text-lg font-semibold">{value === null ? "—" : value}</p>
  </div>
);

function TeacherCard({ teacher }: { teacher: TeacherDigest }) {
  return (
    <article className="rounded-3xl border border-card-border bg-card-bg p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{teacher.teacherName}</h2>
          <p className="text-sm opacity-70">
            {teacher.lessons} lesson{teacher.lessons === 1 ? "" : "s"} ·{" "}
            {teacher.reviewed} reviewed · {teacher.unreviewed} pending
            {teacher.flaggedLessons > 0
              ? ` · ${teacher.flaggedLessons} flagged`
              : ""}
          </p>
        </div>
        {teacher.unreviewed > 0 ? (
          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
            {teacher.unreviewed} awaiting review
          </span>
        ) : (
          <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
            Week complete
          </span>
        )}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {score("Clarity", teacher.avgTeachingClarity)}
        {score("Practice", teacher.avgStudentPractice)}
        {score("Correction", teacher.avgCorrectionQuality)}
        {score("Engagement", teacher.avgEngagement)}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide opacity-70">
            Follow-up actions
          </h3>
          {teacher.actions.length === 0 ? (
            <p className="text-sm opacity-60">
              No gaps or actions recorded from the submitted reviews.
            </p>
          ) : (
            <ul className="space-y-2">
              {teacher.actions.map((action) => (
                <li
                  key={action.lessonId}
                  className="rounded-xl border border-card-border p-3 text-sm"
                >
                  <Link
                    href={`/support/transcripts/${action.lessonId}`}
                    className="font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-400"
                  >
                    {display(action.startsAt)} · {action.studentName}
                  </Link>
                  {action.gaps ? (
                    <p className="mt-1">
                      <span className="opacity-60">Gap: </span>
                      {action.gaps}
                    </p>
                  ) : null}
                  {action.teacherAction ? (
                    <p className="mt-1">
                      <span className="opacity-60">Teacher: </span>
                      {action.teacherAction}
                    </p>
                  ) : null}
                  {action.studentAction ? (
                    <p className="mt-1">
                      <span className="opacity-60">Student: </span>
                      {action.studentAction}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide opacity-70">
            Not yet reviewed
          </h3>
          {teacher.unreviewedLessons.length === 0 ? (
            <p className="text-sm opacity-60">
              Every lesson this week is done.
            </p>
          ) : (
            <ul className="space-y-2">
              {teacher.unreviewedLessons.map((lesson) => (
                <li key={lesson.lessonId}>
                  <Link
                    href={`/support/transcripts/${lesson.lessonId}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-card-border p-3 text-sm hover:border-green-500"
                  >
                    <span>
                      {display(lesson.startsAt)} · {lesson.studentName}
                    </span>
                    <span className="flex items-center gap-2 text-xs opacity-70">
                      {lesson.flaggedSegments > 0 ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300">
                          <AlertTriangle size={13} />
                          {lesson.flaggedSegments}
                        </span>
                      ) : null}
                      {lesson.reviewStatus === "draft" ? "draft" : "open"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}

export default function SupportWeeklyDigestPage() {
  const { role } = useAuth();
  const canReview =
    role === "support" || role === "admin" || role === "super_admin";
  const [weekStart, setWeekStart] = useState(currentMonday);

  const digestQuery = useQuery({
    queryKey: ["review-digest", weekStart],
    queryFn: () => getWeeklyDigest(weekStart),
    enabled: canReview,
  });

  if (!canReview) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Support or admin access is required to view the weekly digest.
      </main>
    );
  }

  const digest = digestQuery.data;

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 text-foreground">
      <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Weekly teacher digest</h1>
          <p className="text-lg text-foreground opacity-75">
            Submitted reviews grouped by teacher for the week, with the actions
            to pass on and the lessons still waiting for review.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            aria-label="Previous week"
            onClick={() => setWeekStart(shiftWeek(weekStart, -7))}
            className="rounded-xl border border-card-border bg-card-bg p-2.5 hover:border-green-500"
          >
            <ChevronLeft size={18} />
          </button>
          <label className="flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-3 py-2">
            <CalendarDays size={16} className="opacity-60" />
            <span className="text-sm opacity-70">Week starting</span>
            <input
              type="date"
              value={weekStart}
              onChange={(event) => {
                if (event.target.value) setWeekStart(event.target.value);
              }}
              className="bg-transparent text-sm focus:outline-none"
            />
          </label>
          <button
            type="button"
            aria-label="Next week"
            onClick={() => setWeekStart(shiftWeek(weekStart, 7))}
            className="rounded-xl border border-card-border bg-card-bg p-2.5 hover:border-green-500"
          >
            <ChevronRight size={18} />
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(currentMonday())}
            className="rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold hover:border-green-500"
          >
            This week
          </button>
        </div>

        {digestQuery.isLoading ? (
          <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-10 text-center opacity-70">
            Building the digest…
          </div>
        ) : digestQuery.isError || !digest ? (
          <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-10 text-center">
            <p className="mb-4 opacity-70">
              The digest could not be loaded. Check the API connection and your
              permissions.
            </p>
            <button
              type="button"
              onClick={() => void digestQuery.refetch()}
              className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold hover:border-green-500"
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-3xl border border-card-border bg-card-bg p-6">
              <p className="text-sm opacity-70">
                {formatWeek(digest.weekStart, digest.weekEnd)}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl font-bold">{digest.lessons}</p>
                  <p className="text-xs uppercase tracking-wide opacity-60">
                    Lessons
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{digest.reviewed}</p>
                  <p className="text-xs uppercase tracking-wide opacity-60">
                    Reviewed
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{digest.flaggedLessons}</p>
                  <p className="text-xs uppercase tracking-wide opacity-60">
                    Flagged lessons
                  </p>
                </div>
              </div>
            </div>

            {digest.teachers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-10 text-center opacity-70">
                No lessons with transcripts in this week.
              </div>
            ) : (
              <div className="space-y-5">
                {digest.teachers.map((teacher) => (
                  <TeacherCard key={teacher.teacherId} teacher={teacher} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
