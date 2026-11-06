"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarPlus, RefreshCw, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { OpenOfferInbox } from "@/components/teacher/OpenOfferInbox";
import {
  deleteWeeklyAvailability,
  getMyAvailabilityRules,
  publishWeeklyAvailability,
} from "@/services/scheduling.service";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";
import {
  WEEKDAY_LABELS,
  WEEKDAY_SHORT,
  formatWeeklyTimeRange,
  weekdayLabel,
} from "@/lib/utils";
import type { WeeklyRule } from "@/types/scheduling";

const DAY_ORDER = [6, 0, 1, 2, 3, 4, 5];
const DEFAULT_DAYS = [6, 0, 1, 2, 3, 4];
const DURATIONS = [30, 45, 60] as const;
type DurationMinutes = (typeof DURATIONS)[number];

const minutesOf = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return NaN;
  return hours * 60 + minutes;
};

const addMinutes = (value: string, minutes: number) => {
  const total = minutesOf(value) + minutes;
  if (!Number.isFinite(total)) return "";
  const hours = `${Math.floor(total / 60) % 24}`.padStart(2, "0");
  const rest = `${total % 60}`.padStart(2, "0");
  return `${hours}:${rest}`;
};

const durationLabel = (minutes: number) =>
  minutes === 60 ? "1 hour" : `${minutes} min`;

export default function TeacherAvailabilityPage() {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [days, setDays] = useState<number[]>(DEFAULT_DAYS);
  const [start, setStart] = useState("17:00");
  const [duration, setDuration] = useState<DurationMinutes>(60);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const end = addMinutes(start, duration);

  const timeZoneId = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    []
  );

  const rulesQuery = useQuery({
    queryKey: ["availability-rules", "teacher"],
    queryFn: getMyAvailabilityRules,
    enabled: role === "teacher",
    refetchInterval: LIVE_SYNC_INTERVAL,
  });

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["availability-rules"] }),
      queryClient.invalidateQueries({ queryKey: ["availability"] }),
      queryClient.invalidateQueries({ queryKey: ["teachers"] }),
      queryClient.invalidateQueries({ queryKey: ["teacher-profile"] }),
    ]);
  };

  const publishMutation = useMutation({
    mutationFn: () =>
      publishWeeklyAvailability({
        daysOfWeek: days,
        startsAtTime: start,
        endsAtTime: end,
        timeZoneId,
      }),
    onSuccess: async (created) => {
      setFormError("");
      setNotice(
        `Announced ${created.length} weekly ${
          created.length === 1 ? "time" : "times"
        }. Students can book them now.`
      );
      await invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ruleId: string) => deleteWeeklyAvailability(ruleId),
    onSuccess: async () => {
      setFormError("");
      setNotice("Weekly time removed.");
      await invalidate();
    },
  });

  const rules = useMemo(
    () =>
      [...(rulesQuery.data ?? [])].sort(
        (a, b) =>
          DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek) ||
          a.startsAtTime.localeCompare(b.startsAtTime)
      ),
    [rulesQuery.data]
  );

  const toggleDay = (day: number) => {
    setNotice("");
    setDays((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day]
    );
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setNotice("");
    setFormError("");
    if (!days.length) {
      setFormError("Choose at least one weekday.");
      return;
    }
    if (!Number.isFinite(minutesOf(start))) {
      setFormError("Choose a valid start time.");
      return;
    }
    publishMutation.mutate();
  };

  const confirmRemove = (rule: WeeklyRule) => {
    if (
      window.confirm(
        `Remove ${weekdayLabel(rule.dayOfWeek)} · ${formatWeeklyTimeRange(
          rule.startsAtTime,
          rule.endsAtTime
        )}? Students will no longer see this time.`
      )
    ) {
      setNotice("");
      deleteMutation.mutate(rule.id);
    }
  };

  const summary = days.length
    ? `${days
        .slice()
        .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))
        .map((day) => WEEKDAY_SHORT[day])
        .join(", ")} · ${start} – ${end}`
    : "Choose the days you teach.";

  const error =
    formError ||
    (rulesQuery.error ?? publishMutation.error ?? deleteMutation.error);

  if (role !== "teacher")
    return (
      <main className="mx-auto max-w-5xl px-5 py-16">
        Please sign in with a teacher account.
      </main>
    );

  return (
    <main className="min-h-[75vh] bg-background px-5 py-12 text-foreground md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-amber-700 dark:text-amber-300">
              Teacher portal
            </p>
            <h1 className="mt-2 text-3xl font-bold">Weekly availability</h1>
            <p className="mt-2 text-foreground/70">
              Announce the weekly times you teach. A student&apos;s booking is
              instant and repeats every week.
            </p>
          </div>
          <button
            onClick={() => void rulesQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold transition hover:border-green-500"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
          >
            {error instanceof Error
              ? error.message
              : error || "Unable to update availability."}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="mt-6 rounded-xl bg-green-500/10 p-4 text-sm text-green-800 dark:text-green-300"
          >
            {notice}
          </p>
        )}

        <OpenOfferInbox />

        <div className="mt-8 grid gap-6 md:grid-cols-[.9fr_1.1fr]">
          <form
            onSubmit={submit}
            className="h-fit rounded-3xl border border-card-border bg-card-bg p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <CalendarPlus className="text-green-700 dark:text-green-400" />
              <h2 className="text-xl font-bold">Announce weekly times</h2>
            </div>

            <fieldset className="mt-6">
              <legend className="text-sm font-semibold">Days</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {DAY_ORDER.map((day) => {
                  const selected = days.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleDay(day)}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                        selected
                          ? "border-green-700 bg-green-500/15 text-green-900 dark:text-green-300 dark:border-green-400"
                          : "border-card-border bg-card-bg text-foreground/60 hover:border-green-500"
                      }`}
                    >
                      {WEEKDAY_SHORT[day]}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-foreground/60">
                A student books the whole window as one weekly lesson.
              </p>
            </fieldset>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                Starts at
                <input
                  required
                  type="time"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-card-border bg-background px-3 py-3 font-normal text-foreground outline-none focus:border-green-500"
                />
              </label>
              <fieldset>
                <legend className="text-sm font-semibold">Length</legend>
                <div className="mt-2 flex gap-2">
                  {DURATIONS.map((minutes) => {
                    const selected = duration === minutes;
                    return (
                      <button
                        key={minutes}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setDuration(minutes)}
                        className={`flex-1 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                          selected
                            ? "border-green-700 bg-green-500/15 text-green-900 dark:border-green-400 dark:text-green-300"
                            : "border-card-border bg-card-bg text-foreground/60 hover:border-green-500"
                        }`}
                      >
                        {durationLabel(minutes)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            <div className="mt-5 rounded-xl bg-green-500/10 p-4 text-sm">
              <p className="font-semibold">{summary}</p>
              <p className="mt-1 text-xs text-foreground/60">
                Repeats every week · times are in {timeZoneId}
              </p>
            </div>

            <button
              disabled={publishMutation.isPending}
              className="mt-6 w-full rounded-xl bg-[#1c5145] px-4 py-3 font-semibold text-white transition hover:bg-[#163f36] disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-500"
            >
              {publishMutation.isPending
                ? "Announcing…"
                : "Announce availability"}
            </button>
          </form>

          <section className="rounded-3xl border border-card-border bg-card-bg p-6 shadow-sm">
            <h2 className="text-xl font-bold">
              Announced times ({rules.length})
            </h2>
            <div className="mt-5 space-y-4">
              {rulesQuery.isLoading ? (
                <p className="text-sm text-foreground/60">
                  Loading your availability…
                </p>
              ) : rules.length ? (
                DAY_ORDER.map((day) => {
                  const dayRules = rules.filter(
                    (rule) => rule.dayOfWeek === day
                  );
                  if (!dayRules.length) return null;
                  return (
                    <div key={day}>
                      <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                        {WEEKDAY_LABELS[day]}
                      </p>
                      <div className="mt-2 space-y-2">
                        {dayRules.map((rule) => {
                          const booked = rule.status === "booked";
                          const yours = rule.status === "yours";
                          const removing =
                            deleteMutation.isPending &&
                            deleteMutation.variables === rule.id;
                          return (
                            <div
                              key={rule.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-card-border p-4"
                            >
                              <div>
                                <p className="font-semibold">
                                  {formatWeeklyTimeRange(
                                    rule.startsAtTime,
                                    rule.endsAtTime
                                  )}
                                </p>
                                <p className="mt-1 text-sm text-foreground/60">
                                  {booked || yours
                                    ? "Booked by a student · repeats weekly."
                                    : "Open for a student to book."}
                                </p>
                              </div>
                              {booked || yours ? (
                                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800 dark:bg-sky-500/15 dark:text-sky-300">
                                  Booked
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => confirmRemove(rule)}
                                  disabled={removing}
                                  aria-label="Remove weekly time"
                                  className="rounded-lg p-2 text-red-600 transition hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="rounded-xl border border-dashed border-card-border p-8 text-center text-sm text-foreground/60">
                  You haven&apos;t announced any weekly times yet. Students can
                  book as soon as you do.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
