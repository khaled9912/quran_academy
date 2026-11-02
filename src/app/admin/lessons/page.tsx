"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MonitorPlay, RefreshCw } from "lucide-react";
import { getLessons } from "@/services/lesson.service";
import { useAuth } from "@/providers/auth-provider";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";
import type { Lesson } from "@/types/lesson";

const display = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const timeOnly = (value: string) =>
  new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

type Phase = "live" | "upcoming" | "past";

const phaseOf = (lesson: Lesson): Phase => {
  if (lesson.status === "cancelled") return "past";
  // The clock decides: a lesson marked ended early is still joinable until its
  // scheduled end, matching the room page.
  if (new Date(lesson.endsAt).getTime() <= Date.now()) return "past";
  return new Date(lesson.startsAt).getTime() > Date.now() ? "upcoming" : "live";
};

const LessonRow = ({ lesson }: { lesson: Lesson }) => {
  const phase = phaseOf(lesson);
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-card-border bg-card-bg p-5">
      <div>
        <p className="font-semibold">
          {lesson.teacherName ?? "Teacher"} with{" "}
          {lesson.studentName ?? "Student"}
        </p>
        <p className="mt-1 text-sm text-foreground opacity-70">
          {display(lesson.startsAt)} – {timeOnly(lesson.endsAt)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {phase === "live" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Live
          </span>
        ) : lesson.status === "cancelled" ? (
          <span className="rounded-full border border-card-border px-3 py-1 text-xs font-semibold opacity-70">
            Cancelled
          </span>
        ) : phase === "upcoming" ? (
          <span className="rounded-full border border-card-border px-3 py-1 text-xs font-semibold opacity-70">
            Opens {timeOnly(lesson.startsAt)}
          </span>
        ) : (
          <span className="rounded-full border border-card-border px-3 py-1 text-xs font-semibold opacity-70">
            Ended
          </span>
        )}
        {lesson.status !== "cancelled" ? (
          <Link
            href={`/lesson/${lesson.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
          >
            <MonitorPlay size={16} />
            {phase === "past"
              ? "Open recap"
              : phase === "upcoming"
                ? "View room"
                : "Open room"}
          </Link>
        ) : null}
      </div>
    </div>
  );
};

const Section = ({
  title,
  description,
  lessons,
}: {
  title: string;
  description: string;
  lessons: Lesson[];
}) => {
  if (lessons.length === 0) return null;
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-1">{title}</h2>
      <p className="mb-4 text-sm text-foreground opacity-70">{description}</p>
      <div className="space-y-3">
        {lessons.map((lesson) => (
          <LessonRow key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </section>
  );
};

export default function AdminLessonsPage() {
  const { role } = useAuth();
  const canManage = role === "admin" || role === "super_admin";

  const lessonsQuery = useQuery({
    queryKey: ["lessons"],
    queryFn: () => getLessons(),
    enabled: canManage,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });

  if (!canManage) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Admin access is required to open lesson rooms.
      </main>
    );
  }

  const lessons = lessonsQuery.data ?? [];
  const live = lessons.filter((lesson) => phaseOf(lesson) === "live");
  const upcoming = lessons.filter((lesson) => phaseOf(lesson) === "upcoming");
  const past = [...lessons]
    .filter((lesson) => phaseOf(lesson) === "past")
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <Link
            href="/admin/dashboard"
            className="text-green-600 hover:text-green-700 mb-3 inline-block"
          >
            ← Back to admin dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">Lesson rooms</h1>
          <p className="text-lg text-foreground opacity-75">
            Open any lesson room to support a teacher or student. You join as a
            third participant, and both sides see “Academy support” next to your
            name.
          </p>
        </div>

        {lessonsQuery.isLoading ? (
          <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-10 text-center opacity-70">
            Loading lessons…
          </div>
        ) : lessonsQuery.isError ? (
          <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-10 text-center">
            <p className="mb-4 opacity-70">
              Lessons could not be loaded. Check the API connection and your
              permissions.
            </p>
            <button
              type="button"
              onClick={() => void lessonsQuery.refetch()}
              className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold hover:border-green-500"
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        ) : lessons.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-10 text-center opacity-70">
            No lessons have been confirmed yet.
          </div>
        ) : (
          <>
            <Section
              title="Live now"
              description="The room is open. Joining adds you to the call."
              lessons={live}
            />
            <Section
              title="Upcoming"
              description="Rooms open at their scheduled start time."
              lessons={upcoming}
            />
            <Section
              title="Past lessons"
              description="The room is closed; the recap shows the class report and student review."
              lessons={past}
            />
          </>
        )}
      </div>
    </div>
  );
}
