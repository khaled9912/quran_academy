"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import {
  getMyChangeRequests,
  getMySeries,
  getTeacherWeeklyAvailability,
  requestTimeChange,
} from "@/services/scheduling.service";
import { useAuth } from "@/providers/auth-provider";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";
import { TimeZoneNote } from "@/components/student/TimeZoneNote";
import {
  getViewerTimeZone,
  toViewerWeeklySlotLabel,
  toViewerWeeklyTime,
} from "@/lib/weekly-time";
import {
  WEEKDAY_LABELS,
  WEEKDAY_SHORT,
  formatWeeklyTimeRange,
} from "@/lib/utils";

const DAY_ORDER = [6, 0, 1, 2, 3, 4, 5];

export default function ChangeWeeklyTimePage() {
  const params = useParams<{ seriesId: string }>();
  const seriesId = params?.seriesId ?? "";
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const viewerTimeZone = getViewerTimeZone();
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");

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
  const changesQuery = useQuery({
    queryKey: ["change-requests", "student"],
    queryFn: getMyChangeRequests,
    enabled: role === "student",
    refetchInterval: LIVE_SYNC_INTERVAL,
  });

  const pending = (changesQuery.data ?? []).find(
    (change) => change.status === "pending" && change.seriesId === seriesId
  );

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
      setFormError("");
      setNotice(
        "Request sent. The academy will confirm the new time with your teacher and update your weekly lessons."
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
      setNotice("");
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to send the request. Please try again."
      );
    },
  });

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
          href="/student/availability"
          className="text-sm font-semibold text-green-700 hover:underline dark:text-green-400"
        >
          ← Back to your weekly times
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-amber-700 dark:text-amber-300">
              Weekly lessons
            </p>
            <h1 className="mt-2 text-3xl font-bold">Change your time</h1>
            <p className="mt-2 max-w-xl text-foreground/70">
              Pick a new weekly time. The academy will check it with your
              teacher, then move your lessons.
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

        {notice && (
          <p
            role="status"
            className="mt-6 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-sm text-green-800 dark:text-green-300"
          >
            {notice}
          </p>
        )}
        {formError && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
          >
            {formError}
          </p>
        )}
        {pending && (
          <p
            role="status"
            className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300"
          >
            You already asked to move this weekly time to{" "}
            <strong>
              {toViewerWeeklySlotLabel(
                {
                  dayOfWeek: pending.requestedDayOfWeek,
                  startsAtTime: pending.requestedStartsAtTime,
                  endsAtTime: pending.requestedEndsAtTime,
                  timeZoneId: pending.timeZoneId,
                },
                viewerTimeZone
              )}
            </strong>
            . Wait for the academy to respond first.
          </p>
        )}

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
                <p className="mt-4 rounded-2xl border border-dashed border-card-border p-8 text-center text-sm text-foreground/60">
                  {series.teacherName} has not announced any other weekly times
                  right now.
                </p>
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
                  disabled={!selected || Boolean(pending) || submit.isPending}
                  onClick={() => {
                    setFormError("");
                    setNotice("");
                    if (selected) submit.mutate(selected);
                  }}
                  className="mt-4 w-full rounded-xl bg-[#1c5145] px-4 py-3 font-semibold text-white transition hover:bg-[#163f36] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-500"
                >
                  {submit.isPending ? "Sending…" : "Request this time"}
                </button>
                <p className="mt-3 text-xs leading-5 text-foreground/60">
                  Your current weekly time stays booked until the academy
                  approves the change.
                </p>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
