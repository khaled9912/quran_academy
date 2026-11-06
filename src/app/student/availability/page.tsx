"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { getAssignedWeeklyAvailability } from "@/services/scheduling.service";
import { TeacherDirectory } from "@/components/student/TeacherDirectory";
import { OpenOfferPanel } from "@/components/student/OpenOfferPanel";
import { TimeZoneNote } from "@/components/student/TimeZoneNote";
import { useAuth } from "@/providers/auth-provider";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";
import { WEEKDAY_SHORT } from "@/lib/utils";
import {
  getViewerTimeZone,
  toViewerWeeklySlotLabel,
  toViewerWeeklyTime,
} from "@/lib/weekly-time";

export default function StudentAvailabilityPage() {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const viewerTimeZone = getViewerTimeZone();
  const assignedQuery = useQuery({
    queryKey: ["availability", "student"],
    queryFn: getAssignedWeeklyAvailability,
    enabled: role === "student",
    refetchInterval: LIVE_SYNC_INTERVAL,
  });
  const series = assignedQuery.data?.series ?? [];
  const error = assignedQuery.error;

  if (role !== "student")
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Please sign in with a student account to book weekly lessons.
      </main>
    );

  return (
    <main className="min-h-[75vh] bg-background px-5 py-12 text-foreground md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-amber-700 dark:text-amber-300">
              Student portal
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Teachers and weekly times
            </h1>
            <p className="mt-2 max-w-2xl text-foreground/70">
              Choose a teacher and the weekly times that suit you. Booking is
              instant, repeats every week, and needs no approval.
            </p>
          </div>
          <button
            onClick={() => {
              void assignedQuery.refetch();
              void queryClient.invalidateQueries({
                queryKey: ["teachers", "directory"],
              });
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold transition hover:border-green-500"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
          >
            {error instanceof Error
              ? error.message
              : "Unable to load your weekly times."}
          </p>
        )}

        {!assignedQuery.isLoading && !assignedQuery.data?.teacher ? (
          <OpenOfferPanel />
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
          <TeacherDirectory />

          <aside className="h-fit space-y-4 rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
            <div>
              <h2 className="text-xl font-bold">Your weekly times</h2>
              <p className="mt-2 text-sm leading-6 text-foreground/70">
                These repeat every week. Ask the academy to move a time and your
                current slot stays booked until they approve.
              </p>
              {series.length ? (
                <TimeZoneNote
                  zone={viewerTimeZone}
                  sourceZone={series[0]?.timeZoneId}
                  className="mt-2"
                />
              ) : null}
            </div>

            <div className="space-y-3">
              {assignedQuery.isLoading ? (
                <p className="rounded-xl bg-foreground/5 p-4 text-sm text-foreground/60">
                  Loading your weekly times…
                </p>
              ) : series.length ? (
                series.map((item) => {
                  const local = toViewerWeeklyTime(item, viewerTimeZone);
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-card-border bg-background p-4"
                    >
                      <p className="text-sm font-semibold">
                        {toViewerWeeklySlotLabel(item, viewerTimeZone)}
                      </p>
                      <p className="mt-1 text-xs text-foreground/60">
                        Repeats every {WEEKDAY_SHORT[local.dayOfWeek]}
                      </p>
                      <Link
                        href={`/student/change-time/${item.id}`}
                        className="mt-3 inline-block text-xs font-semibold text-green-700 hover:underline dark:text-green-400"
                      >
                        Change weekly time →
                      </Link>
                    </div>
                  );
                })
              ) : (
                <p className="rounded-xl bg-foreground/5 p-4 text-sm text-foreground/60">
                  No weekly time booked yet. Choose a teacher and pick your
                  times.
                </p>
              )}
            </div>

            <Link
              href="/schedule"
              className="inline-block text-sm font-semibold text-green-700 hover:underline dark:text-green-400"
            >
              My schedule →
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
