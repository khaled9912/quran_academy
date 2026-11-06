"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import {
  getAssignedWeeklyAvailability,
  getTeacherDirectory,
} from "@/services/scheduling.service";
import { Avatar } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { useAuth } from "@/providers/auth-provider";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";
import { WEEKDAY_SHORT } from "@/lib/utils";
import { TimeZoneNote } from "@/components/student/TimeZoneNote";
import { getViewerTimeZone, viewerWeekdays } from "@/lib/weekly-time";

interface TeacherDirectoryProps {
  compact?: boolean;
}

export function TeacherDirectory({ compact = false }: TeacherDirectoryProps) {
  const { role } = useAuth();
  const enabled = role === "student";
  const viewerTimeZone = getViewerTimeZone();

  const directoryQuery = useQuery({
    queryKey: ["teachers", "directory"],
    queryFn: getTeacherDirectory,
    enabled,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });
  const assignedQuery = useQuery({
    queryKey: ["availability", "student"],
    queryFn: getAssignedWeeklyAvailability,
    enabled,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });
  const teachers = [...(directoryQuery.data ?? [])].sort(
    (a, b) =>
      Number(b.slots.some((slot) => slot.status === "available")) -
      Number(a.slots.some((slot) => slot.status === "available"))
  );
  const assignedTeacherId = assignedQuery.data?.teacher?.id;
  const visibleTeachers = compact ? teachers.slice(0, 3) : teachers;
  const error = directoryQuery.error ?? assignedQuery.error;
  const loading = directoryQuery.isLoading || assignedQuery.isLoading;

  return (
    <section className="rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <CalendarDays className="text-green-600 dark:text-green-400" />
          <div>
            <h2 className="text-2xl font-semibold">
              {compact ? "Choose your teacher" : "Teachers and weekly times"}
            </h2>
            <p className="mt-1 text-sm text-foreground opacity-70">
              Pick any weekly times that suit you. Booking is instant and the
              time repeats every week — no approval needed.
            </p>
          </div>
        </div>
        {compact && (
          <Link
            href="/student/availability"
            className="shrink-0 text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"
          >
            See all teachers →
          </Link>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
        >
          {error instanceof Error
            ? error.message
            : "Unable to load the teacher list."}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-foreground opacity-70">
          Loading teacher profiles…
        </p>
      ) : visibleTeachers.length ? (
        <>
          <TimeZoneNote zone={viewerTimeZone} className="mt-5" />
          <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleTeachers.map((entry) => {
              const open = entry.slots.filter(
                (slot) => slot.status === "available"
              );
              const days = viewerWeekdays(open, viewerTimeZone);
              const isAssigned = entry.teacher.id === assignedTeacherId;
              return (
                <article
                  key={entry.teacher.id}
                  className="flex flex-col rounded-2xl border border-card-border bg-background p-5"
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={entry.teacher.fullName ?? ""}
                      src={entry.teacher.avatarUrl}
                      className="h-14 w-14 rounded-2xl text-lg"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/student/teachers/${entry.teacher.id}`}
                          className="text-lg font-semibold hover:text-green-600 hover:underline"
                        >
                          {entry.teacher.fullName}
                        </Link>
                        {isAssigned && (
                          <span className="rounded-full bg-green-100 dark:bg-green-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-green-800 dark:text-green-300">
                            Your teacher
                          </span>
                        )}
                      </div>
                      {entry.reviewCount > 0 ? (
                        <StarRating
                          value={entry.averageRating ?? null}
                          count={entry.reviewCount}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-xs text-foreground opacity-60">
                          New teacher
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground opacity-60">
                      {open.length
                        ? `${open.length} weekly ${
                            open.length === 1 ? "time" : "times"
                          } available`
                        : "No weekly times right now"}
                    </p>
                    {days.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {days.map((day) => (
                          <span
                            key={day}
                            className="rounded-full bg-green-500/10 px-2.5 py-1 text-[11px] font-semibold text-green-700 dark:text-green-400"
                          >
                            {WEEKDAY_SHORT[day]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/student/teachers/${entry.teacher.id}`}
                    className="mt-4 inline-flex items-center justify-center rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
                  >
                    {open.length ? "Choose weekly times" : "View profile"}
                  </Link>
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-card-border p-8 text-center text-sm text-foreground opacity-70">
          No teacher has announced weekly times yet. Please check back soon.
        </p>
      )}
    </section>
  );
}
