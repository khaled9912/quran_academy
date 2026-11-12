"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import {
  endWeeklySeries,
  getMySeries,
  getTeacherWeeklyAvailability,
  requestTimeChange,
} from "@/services/scheduling.service";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { ApiError } from "@/lib/backend-client";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";
import { TimeZoneNote } from "@/components/student/TimeZoneNote";
import { getViewerTimeZone, toViewerWeeklyTime } from "@/lib/weekly-time";
import {
  WEEKDAY_LABELS,
  WEEKDAY_SHORT,
  formatWeeklyTimeRange,
} from "@/lib/utils";

const DAY_ORDER = [6, 0, 1, 2, 3, 4, 5];

export default function ChangeWeeklyTimePage() {
  const params = useParams<{ seriesId: string }>();
  const seriesId = params?.seriesId ?? "";
  const router = useRouter();
  const { role } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const viewerTimeZone = getViewerTimeZone();
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const seriesQuery = useQuery({
    queryKey: ["series"],
    queryFn: getMySeries,
    enabled: role === "student",
    refetchInterval: LIVE_SYNC_INTERVAL,
  });
  const series = (seriesQuery.data ?? []).find((item) => item.id === seriesId);
  const teacherId = series?.teacherId ?? "";
  const seriesLocal = series
    ? toViewerWeeklyTime(series, viewerTimeZone)
    : null;

  const teacherQuery = useQuery({
    queryKey: ["teacher-profile", teacherId],
    queryFn: () => getTeacherWeeklyAvailability(teacherId),
    enabled: role === "student" && Boolean(teacherId),
    refetchInterval: LIVE_SYNC_INTERVAL,
  });
  const available = useMemo(() => {
    const rules = teacherQuery.data?.slots ?? [];
    return rules
      .filter((rule) => rule.status === "available")
      .map((rule) => ({
        rule,
        local: toViewerWeeklyTime(rule, viewerTimeZone),
      }))
      .sort(
        (a, b) =>
          DAY_ORDER.indexOf(a.local.dayOfWeek) -
            DAY_ORDER.indexOf(b.local.dayOfWeek) ||
          a.local.startsAtTime.localeCompare(b.local.startsAtTime)
      );
  }, [teacherQuery.data, viewerTimeZone]);

  const grouped = available.reduce<
    Record<number, (typeof available)[number][]>
  >((acc, entry) => {
    (acc[entry.local.dayOfWeek] ??= []).push(entry);
    return acc;
  }, {});

  const submit = useMutation({
    mutationFn: (ruleId: string) =>
      series
        ? requestTimeChange(series.id, ruleId, note)
        : Promise.reject(new Error("This weekly time no longer exists.")),
    onSuccess: async () => {
      showToast(
        "Your weekly time is changed. Your upcoming lessons are on the new time now.",
        "success"
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["change-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["series"] }),
        queryClient.invalidateQueries({ queryKey: ["lessons"] }),
        queryClient.invalidateQueries({ queryKey: ["availability"] }),
      ]);
      setSelected(null);
      setNote("");
    },
    onError: (error) => {
      if (!(error instanceof ApiError))
        showToast("Unable to send the request. Please try again.", "error");
    },
  });

  const endSeries = useMutation({
    mutationFn: () =>
      series
        ? endWeeklySeries(series.id)
        : Promise.reject(new Error("This weekly time no longer exists.")),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["series"] }),
        queryClient.invalidateQueries({ queryKey: ["availability"] }),
        queryClient.invalidateQueries({ queryKey: ["change-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["lessons"] }),
      ]);
      router.push("/student/dashboard");
    },
    onError: (error) => {
      if (!(error instanceof ApiError))
        showToast(
          error instanceof Error
            ? error.message
            : "Unable to end the weekly time. Please try again.",
          "error"
        );
    },
  });

  const confirmEndSeries = () => {
    if (!series) return;
    if (
      !window.confirm(
        `End these weekly lessons?\n\nThis cancels your future lessons with ${series.teacherName} and lets your teacher know. Message the academy whenever you want a new weekly time.`
      )
    )
      return;
    endSeries.mutate();
  };

  if (role !== "student") {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Please sign in with a student account to change a weekly time.
      </main>
    );
  }

  return (
    <main className="min-h-[75vh] bg-background px-5 py-12 text-foreground md:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/student/dashboard"
          className="text-sm font-semibold text-green-700 hover:underline dark:text-green-400"
        >
          ← Back to your dashboard
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-amber-700 dark:text-amber-300">
              Weekly lessons
            </p>
            <h1 className="mt-2 text-3xl font-bold">Change your time</h1>
            <p className="mt-2 max-w-xl text-foreground/70">
              Pick any open weekly time your teacher publishes. Your lessons
              move as soon as you choose it.
            </p>
          </div>
          <button
            onClick={() => {
              void seriesQuery.refetch();
              void teacherQuery.refetch();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold transition hover:border-green-500"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {seriesQuery.isLoading ? (
          <p className="mt-8 text-foreground/70">Loading your weekly time…</p>
        ) : seriesQuery.error ? (
          <p
            role="alert"
            className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
          >
            {seriesQuery.error instanceof Error
              ? seriesQuery.error.message
              : "Unable to load your weekly time."}
          </p>
        ) : !series ? (
          <div className="mt-8 rounded-2xl border border-dashed border-card-border bg-card-bg p-10 text-center text-foreground/60">
            This weekly time is no longer active.{" "}
            <Link
              href="/schedule"
              className="font-semibold text-green-700 hover:underline dark:text-green-400"
            >
              Open your schedule
            </Link>
            .
          </div>
        ) : (
          <>
            <section className="mt-8 rounded-3xl border border-card-border bg-card-bg p-6 shadow-sm">
              <h2 className="text-lg font-bold">Current weekly time</h2>
              <p className="mt-3 text-lg font-semibold">
                {formatWeeklyTimeRange(
                  seriesLocal?.startsAtTime ?? series.startsAtTime,
                  seriesLocal?.endsAtTime ?? series.endsAtTime
                )}
              </p>
              <p className="mt-1 text-sm text-foreground/70">
                With {series.teacherName} · repeats every{" "}
                {WEEKDAY_SHORT[seriesLocal?.dayOfWeek ?? series.dayOfWeek]}
              </p>
              <TimeZoneNote
                zone={viewerTimeZone}
                sourceZone={series.timeZoneId}
                className="mt-3"
              />
            </section>

            <section className="mt-6 rounded-3xl border border-card-border bg-card-bg p-6 shadow-sm">
              <h2 className="text-lg font-bold">Choose a new time</h2>
              {available.length > 0 && (
                <TimeZoneNote
                  zone={viewerTimeZone}
                  sourceZone={
                    available[0]?.rule.timeZoneId ?? series.timeZoneId
                  }
                  className="mt-2"
                />
              )}
              {teacherQuery.isLoading ? (
                <p className="mt-4 text-sm text-foreground/70">
                  Loading available times…
                </p>
              ) : teacherQuery.error ? (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
                >
                  {teacherQuery.error instanceof Error
                    ? teacherQuery.error.message
                    : "Unable to load available times."}
                </p>
              ) : available.length ? (
                <div className="mt-5 space-y-5">
                  {DAY_ORDER.filter((day) => grouped[day]?.length).map(
                    (day) => (
                      <div key={day}>
                        <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                          {WEEKDAY_LABELS[day]}
                        </p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {grouped[day].map(({ rule, local }) => {
                            const chosen = selected === rule.id;
                            return (
                              <button
                                key={rule.id}
                                type="button"
                                aria-pressed={chosen}
                                onClick={() =>
                                  setSelected(chosen ? null : rule.id)
                                }
                                className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition ${
                                  chosen
                                    ? "border-green-600 bg-green-500/15"
                                    : "border-card-border hover:border-green-500"
                                }`}
                              >
                                <span className="min-w-0">
                                  <span className="block font-semibold">
                                    {formatWeeklyTimeRange(
                                      local.startsAtTime,
                                      local.endsAtTime
                                    )}
                                  </span>
                                  <span className="block text-xs text-foreground/60">
                                    {chosen ? "Selected" : "Available"}
                                  </span>
                                </span>
                                {chosen && (
                                  <span className="rounded-full bg-[#1c5145] px-3 py-1 text-xs font-semibold text-white dark:bg-green-600">
                                    Selected
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-card-border p-8 text-center">
                  <p className="font-semibold">No other times available</p>
                  <p className="mt-2 text-sm text-foreground/60">
                    {series.teacherName} has not announced any other weekly
                    times right now. Message the academy if you need a
                    different teacher, or end this weekly time below.
                  </p>
                  <Link
                    href="/contact"
                    className="mt-5 inline-block rounded-xl border border-card-border px-4 py-2.5 text-sm font-semibold transition hover:border-green-500"
                  >
                    Message the academy
                  </Link>
                </div>
              )}
            </section>

            {available.length > 0 && (
              <section className="mt-6 rounded-3xl border border-card-border bg-card-bg p-6 shadow-sm">
                <label className="block text-sm font-semibold">
                  Note for the academy (optional)
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                    placeholder="Anything they should know about the new time?"
                    className="mt-2 w-full rounded-xl border border-card-border bg-background px-3 py-3 font-normal text-foreground outline-none placeholder:text-foreground/40 focus:border-green-500"
                  />
                </label>
                <button
                  type="button"
                  disabled={!selected || submit.isPending}
                  onClick={() => {
                    if (selected) submit.mutate(selected);
                  }}
                  className="mt-4 w-full rounded-xl bg-[#1c5145] px-4 py-3 font-semibold text-white transition hover:bg-[#163f36] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-500"
                >
                  {submit.isPending ? "Moving…" : "Move to this time"}
                </button>
                <p className="mt-3 text-xs leading-5 text-foreground/60">
                  Your lessons move to the new time right away. Your teacher and
                  the academy are told about it.
                </p>
              </section>
            )}

            <section className="mt-6 rounded-3xl border border-card-border bg-card-bg p-6 shadow-sm">
              <h2 className="text-lg font-semibold">
                Stop these weekly lessons
              </h2>
              <p className="mt-2 text-sm leading-6 text-foreground/60">
                Ending this weekly time cancels every future lesson with{" "}
                {series.teacherName}, not just the next one. Your teacher is
                told and the time opens up for other students. Lessons you have
                already taken, and your credits, are unaffected.
              </p>
              <button
                type="button"
                disabled={endSeries.isPending}
                onClick={confirmEndSeries}
                className="mt-4 w-full rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6 dark:text-red-300"
              >
                {endSeries.isPending ? "Ending…" : "End weekly lessons"}
              </button>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
