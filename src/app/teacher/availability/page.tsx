"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarPlus, RefreshCw, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
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
const MAX_SLOT_MINUTES = 240;

const minutesOf = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return NaN;
  return hours * 60 + minutes;
};

export default function TeacherAvailabilityPage() {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [days, setDays] = useState<number[]>(DEFAULT_DAYS);
  const [start, setStart] = useState("17:00");
  const [end, setEnd] = useState("18:00");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

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
    const duration = minutesOf(end) - minutesOf(start);
    if (!(duration > 0)) {
      setFormError("The end time must be after the start time.");
      return;
    }
    if (duration > MAX_SLOT_MINUTES) {
      setFormError("A weekly slot can last up to 4 hours.");
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
    <main className="min-h-[75vh] bg-[#fbfaf6] px-5 py-12 text-[#173b35] md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-[#a7773e]">
              Teacher portal
            </p>
            <h1 className="mt-2 text-3xl font-bold">Weekly availability</h1>
            <p className="mt-2 text-[#6b7c73]">
              Announce the weekly times you teach. A student&apos;s booking is
              instant and repeats every week.
            </p>
          </div>
          <button
            onClick={() => void rulesQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-xl border border-[#d8e2d4] bg-white px-4 py-2.5 text-sm font-semibold"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {error instanceof Error
              ? error.message
              : error || "Unable to update availability."}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-800"
          >
            {notice}
          </p>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-[.9fr_1.1fr]">
          <form
            onSubmit={submit}
            className="h-fit rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <CalendarPlus className="text-[#6f8c69]" />
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
                          ? "border-[#1c5145] bg-[#eef3e9] text-[#1c5145]"
                          : "border-[#dce5d9] bg-white text-[#7b8981] hover:border-[#6f8c69]"
                      }`}
                    >
                      {WEEKDAY_SHORT[day]}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-[#7b8981]">
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
                  className="mt-2 w-full rounded-xl border border-[#dce5d9] px-3 py-3 font-normal outline-none focus:border-[#6f8c69]"
                />
              </label>
              <label className="block text-sm font-semibold">
                Ends at
                <input
                  required
                  type="time"
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#dce5d9] px-3 py-3 font-normal outline-none focus:border-[#6f8c69]"
                />
              </label>
            </div>

            <div className="mt-5 rounded-xl bg-[#f2f6ef] p-4 text-sm">
              <p className="font-semibold">{summary}</p>
              <p className="mt-1 text-xs text-[#7b8981]">
                Repeats every week · times are in {timeZoneId}
              </p>
            </div>

            <button
              disabled={publishMutation.isPending}
              className="mt-6 w-full rounded-xl bg-[#1c5145] px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              {publishMutation.isPending
                ? "Announcing…"
                : "Announce availability"}
            </button>
          </form>

          <section className="rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">
              Announced times ({rules.length})
            </h2>
            <div className="mt-5 space-y-4">
              {rulesQuery.isLoading ? (
                <p className="text-sm text-[#7b8981]">
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
                      <p className="text-xs font-bold uppercase tracking-wide text-[#b58a52]">
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
                              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e6ebe2] p-4"
                            >
                              <div>
                                <p className="font-semibold">
                                  {formatWeeklyTimeRange(
                                    rule.startsAtTime,
                                    rule.endsAtTime
                                  )}
                                </p>
                                <p className="mt-1 text-sm text-[#7b8981]">
                                  {booked || yours
                                    ? "Booked by a student · repeats weekly."
                                    : "Open for a student to book."}
                                </p>
                              </div>
                              {booked || yours ? (
                                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
                                  Booked
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => confirmRemove(rule)}
                                  disabled={removing}
                                  aria-label="Remove weekly time"
                                  className="rounded-lg p-2 text-[#a65d54] hover:bg-red-50 disabled:opacity-50"
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
                <p className="rounded-xl border border-dashed border-[#d9e3d5] p-8 text-center text-sm text-[#75847b]">
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
