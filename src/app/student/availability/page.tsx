"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import {
  getAssignedWeeklyAvailability,
  getMyChangeRequests,
} from "@/services/scheduling.service";
import { TeacherDirectory } from "@/components/student/TeacherDirectory";
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
  const changesQuery = useQuery({
    queryKey: ["change-requests", "student"],
    queryFn: getMyChangeRequests,
    enabled: role === "student",
    refetchInterval: LIVE_SYNC_INTERVAL,
  });

  const series = assignedQuery.data?.series ?? [];
  const pending = (changesQuery.data ?? []).filter(
    (change) => change.status === "pending"
  );
  const error = assignedQuery.error ?? changesQuery.error;

  if (role !== "student")
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Please sign in with a student account to book weekly lessons.
      </main>
    );

  return (
    <main className="min-h-[75vh] bg-[#fbfaf6] px-5 py-12 text-[#173b35] md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-[#a7773e]">
              Student portal
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Teachers and weekly times
            </h1>
            <p className="mt-2 max-w-2xl text-[#6b7c73]">
              Choose a teacher and the weekly times that suit you. Booking is
              instant, repeats every week, and needs no approval.
            </p>
          </div>
          <button
            onClick={() => {
              void assignedQuery.refetch();
              void changesQuery.refetch();
              void queryClient.invalidateQueries({
                queryKey: ["teachers", "directory"],
              });
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#d8e2d4] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-[#f2f6ef]"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error instanceof Error
              ? error.message
              : "Unable to load your weekly times."}
          </p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
          <TeacherDirectory />

          <aside className="h-fit space-y-4 rounded-3xl border border-[#e5e9df] bg-[#eef3e9] p-6 md:p-8">
            <div>
              <h2 className="text-xl font-bold">Your weekly times</h2>
              <p className="mt-2 text-sm leading-6 text-[#6b7c73]">
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
                <p className="rounded-xl bg-white/70 p-4 text-sm text-[#74847b]">
                  Loading your weekly times…
                </p>
              ) : series.length ? (
                series.map((item) => {
                  const pendingChange = pending.some(
                    (change) => change.seriesId === item.id
                  );
                  const local = toViewerWeeklyTime(item, viewerTimeZone);
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-[#dce6d8] bg-white p-4"
                    >
                      <p className="text-sm font-semibold">
                        {toViewerWeeklySlotLabel(item, viewerTimeZone)}
                      </p>
                      <p className="mt-1 text-xs text-[#74847b]">
                        Repeats every {WEEKDAY_SHORT[local.dayOfWeek]}
                        {pendingChange ? " · change with the academy" : ""}
                      </p>
                      <Link
                        href={`/student/change-time/${item.id}`}
                        className={`mt-3 inline-block text-xs font-semibold ${
                          pendingChange
                            ? "pointer-events-none text-[#9aa79e]"
                            : "text-[#1c5145] hover:underline"
                        }`}
                      >
                        Change weekly time →
                      </Link>
                    </div>
                  );
                })
              ) : (
                <p className="rounded-xl bg-white/70 p-4 text-sm text-[#74847b]">
                  No weekly time booked yet. Choose a teacher and pick your
                  times.
                </p>
              )}
            </div>

            <Link
              href="/schedule"
              className="inline-block text-sm font-semibold text-[#1c5145] hover:underline"
            >
              My schedule →
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
