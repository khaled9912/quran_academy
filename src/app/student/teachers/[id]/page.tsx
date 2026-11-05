"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, Check, Mail, Phone } from "lucide-react";
import {
  bookWeeklySlots,
  getMyChangeRequests,
  getTeacherWeeklyAvailability,
} from "@/services/scheduling.service";
import { Avatar } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { TimeZoneNote } from "@/components/student/TimeZoneNote";
import { useAuth } from "@/providers/auth-provider";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";
import { WEEKDAY_LABELS, formatWeeklyTimeRange } from "@/lib/utils";
import {
  getViewerTimeZone,
  toViewerWeeklySlotLabel,
  toViewerWeeklyTime,
} from "@/lib/weekly-time";
import type { WeeklyRule } from "@/types/scheduling";

const DAY_ORDER = [6, 0, 1, 2, 3, 4, 5];

export default function StudentTeacherBookingPage() {
  const params = useParams<{ id: string }>();
  const teacherId = params?.id ?? "";
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const viewerTimeZone = getViewerTimeZone();
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");

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

  const teacher = teacherQuery.data;
  const pendingChanges = (changesQuery.data ?? []).filter(
    (change) => change.status === "pending"
  );

  const grouped = useMemo(() => {
    const rules = teacher?.slots ?? [];
    return DAY_ORDER.map((day) => ({
      day,
      rules: rules
        .map((rule) => ({
          rule,
          local: toViewerWeeklyTime(rule, viewerTimeZone),
        }))
        .filter((entry) => entry.local.dayOfWeek === day)
        .sort((a, b) =>
          a.local.startsAtTime.localeCompare(b.local.startsAtTime)
        ),
    })).filter((group) => group.rules.length > 0);
  }, [teacher?.slots, viewerTimeZone]);

  const book = useMutation({
    mutationFn: (ruleIds: string[]) => bookWeeklySlots(ruleIds),
    onSuccess: async (result) => {
      setFormError("");
      setSelected([]);
      setNotice(
        `${result.series.length} weekly ${
          result.series.length === 1 ? "time is" : "times are"
        } yours. They repeat every week — ask the academy if you need to change one.${
          result.lessons.some((lesson) => lesson.isTrial)
            ? " Your first lesson is a trial."
            : ""
        }`
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["lessons"] }),
        queryClient.invalidateQueries({ queryKey: ["availability"] }),
        queryClient.invalidateQueries({ queryKey: ["teachers"] }),
        queryClient.invalidateQueries({ queryKey: ["teacher-profile"] }),
        queryClient.invalidateQueries({ queryKey: ["series"] }),
        queryClient.invalidateQueries({ queryKey: ["change-requests"] }),
      ]);
    },
    onError: (error) => {
      setNotice("");
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to book these times. Please try again."
      );
    },
  });

  const toggle = (rule: WeeklyRule) => {
    setNotice("");
    setFormError("");
    if (rule.status !== "available") return;
    setSelected((current) =>
      current.includes(rule.id)
        ? current.filter((id) => id !== rule.id)
        : [...current, rule.id]
    );
  };

  const selectedSlots = (teacher?.slots ?? []).filter((rule) =>
    selected.includes(rule.id)
  );

  if (role !== "student") {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Please sign in with a student account to book weekly lessons.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="mx-auto max-w-5xl px-4 md:px-8 lg:px-16">
        <Link
          href="/student/availability"
          className="mb-6 inline-block text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-400"
        >
          ← Back to teachers
        </Link>

        {teacherQuery.error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
          >
            {teacherQuery.error instanceof Error
              ? teacherQuery.error.message
              : "Unable to load this teacher."}
          </p>
        ) : teacherQuery.isLoading || !teacher ? (
          <p className="text-foreground opacity-70">Loading teacher…</p>
        ) : teacher.teacher ? (
          <>
            <section className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
              <div className="flex items-center gap-5">
                <Avatar
                  name={teacher.teacher.fullName ?? ""}
                  src={teacher.teacher.avatarUrl}
                  className="h-20 w-20 rounded-3xl text-2xl"
                />
                <div>
                  <h1 className="text-3xl font-bold">
                    {teacher.teacher.fullName}
                  </h1>
                  {teacher.reviewCount > 0 ? (
                    <StarRating
                      value={teacher.averageRating ?? null}
                      count={teacher.reviewCount}
                      className="mt-2"
                    />
                  ) : (
                    <p className="mt-2 text-sm text-foreground opacity-70">
                      New teacher at Ana Quran
                    </p>
                  )}
                  {teacher.teacher.email && (
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-foreground opacity-70">
                      <Mail size={14} /> {teacher.teacher.email}
                    </p>
                  )}
                  {teacher.teacher.phoneNumber && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-foreground opacity-70">
                      <Phone size={14} /> {teacher.teacher.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-sm text-foreground opacity-70">
                <p className="font-semibold text-green-600 dark:text-green-400">
                  {teacher.slots.filter((slot) => slot.status === "available")
                    .length || 0}{" "}
                  weekly times open
                </p>
                <p className="mt-1">Booking is instant · repeats weekly</p>
              </div>
            </section>

            {!teacher.hasLessons && (
              <p
                role="status"
                className="mt-6 rounded-xl border border-sky-200 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10 p-4 text-sm text-sky-800 dark:text-sky-300"
              >
                <strong>Your first lesson is a trial.</strong> Your first booked
                lesson is flagged automatically — no extra step.
              </p>
            )}

            {notice && (
              <p
                role="status"
                className="mt-6 rounded-xl border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 p-4 text-sm text-green-800 dark:text-green-300"
              >
                {notice}
              </p>
            )}
            {formError && (
              <p
                role="alert"
                className="mt-6 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
              >
                {formError}
              </p>
            )}

            {teacher.series.length > 0 && (
              <section className="mt-8 rounded-3xl border border-card-border bg-card-bg p-6">
                <h2 className="text-xl font-semibold">Your weekly times</h2>
                <TimeZoneNote
                  zone={viewerTimeZone}
                  sourceZone={teacher.series[0]?.timeZoneId}
                  className="mt-2"
                />
                <div className="mt-4 space-y-3">
                  {teacher.series.map((series) => {
                    const pending = pendingChanges.some(
                      (change) => change.seriesId === series.id
                    );
                    return (
                      <div
                        key={series.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-card-border p-4"
                      >
                        <div>
                          <p className="font-semibold">
                            {toViewerWeeklySlotLabel(series, viewerTimeZone)}
                          </p>
                          <p className="mt-1 text-sm text-foreground opacity-70">
                            {pending
                              ? "Time change with the academy"
                              : "Repeats every week"}
                          </p>
                        </div>
                        <Link
                          href={`/student/change-time/${series.id}`}
                          className={`rounded-xl border border-card-border px-4 py-2 text-sm font-semibold transition ${
                            pending
                              ? "pointer-events-none opacity-50"
                              : "hover:border-green-500"
                          }`}
                        >
                          Change time
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="mt-8 rounded-3xl border border-card-border bg-card-bg p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Weekly availability</h2>
                  <p className="mt-1 text-sm text-foreground opacity-70">
                    Select the weekly times you want. You can choose as many as
                    you need.
                  </p>
                </div>
                {selected.length > 0 && (
                  <span className="rounded-full bg-green-100 dark:bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-800 dark:text-green-300">
                    {selected.length} selected
                  </span>
                )}
              </div>
              <TimeZoneNote
                zone={viewerTimeZone}
                sourceZone={teacher.slots[0]?.timeZoneId}
                className="mt-3"
              />

              {grouped.length ? (
                <div className="mt-6 space-y-5">
                  {grouped.map((group) => (
                    <div key={group.day}>
                      <p className="text-xs font-bold uppercase tracking-wide text-foreground opacity-60">
                        {WEEKDAY_LABELS[group.day]}
                      </p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {group.rules.map(({ rule, local }) => {
                          const chosen = selected.includes(rule.id);
                          const open = rule.status === "available";
                          const yours = rule.status === "yours";
                          return (
                            <button
                              key={rule.id}
                              type="button"
                              aria-pressed={chosen}
                              disabled={!open}
                              onClick={() => toggle(rule)}
                              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                                chosen
                                  ? "border-green-500 bg-green-500/10"
                                  : "border-card-border hover:border-green-500"
                              } ${open ? "" : "cursor-not-allowed opacity-55"}`}
                            >
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                                  chosen
                                    ? "border-green-500 bg-green-500 text-white"
                                    : "border-card-border"
                                }`}
                              >
                                {chosen && <Check size={14} />}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block font-semibold">
                                  {formatWeeklyTimeRange(
                                    local.startsAtTime,
                                    local.endsAtTime
                                  )}
                                </span>
                                <span className="block text-xs text-foreground opacity-65">
                                  {yours
                                    ? "Already booked by you"
                                    : open
                                      ? "Open — repeats every week"
                                      : "Booked by another student"}
                                </span>
                              </span>
                              {yours && (
                                <span className="rounded-full bg-green-100 dark:bg-green-500/15 px-2 py-0.5 text-[11px] font-semibold text-green-800 dark:text-green-300">
                                  Yours
                                </span>
                              )}
                              {!open && !yours && (
                                <span className="rounded-full bg-gray-100 dark:bg-gray-500/15 px-2 py-0.5 text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                                  Booked
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 rounded-2xl border border-dashed border-card-border p-8 text-center text-sm text-foreground opacity-70">
                  This teacher has not announced a weekly schedule yet. Check
                  back soon or choose another teacher.
                </p>
              )}

              {teacher.slots.some((rule) => rule.status === "available") && (
                <div className="mt-6 rounded-2xl bg-background p-4">
                  {selectedSlots.length > 0 ? (
                    <p className="text-sm text-foreground opacity-75">
                      Selected:{" "}
                      {selectedSlots
                        .map((rule) =>
                          toViewerWeeklySlotLabel(rule, viewerTimeZone)
                        )
                        .join(" · ")}
                    </p>
                  ) : (
                    <p className="text-sm text-foreground opacity-70">
                      Pick one or more weekly times above.
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={!selected.length || book.isPending}
                    onClick={() => {
                      setFormError("");
                      setNotice("");
                      book.mutate(selected);
                    }}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-3 font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CalendarCheck size={18} />
                    {book.isPending
                      ? "Booking…"
                      : selected.length
                        ? `Book ${selected.length} weekly ${
                            selected.length === 1 ? "time" : "times"
                          }`
                        : "Select weekly times"}
                  </button>
                  <p className="mt-2 text-xs text-foreground opacity-60">
                    Your selection locks instantly and repeats every week. Your
                    first lesson is a trial.
                  </p>
                </div>
              )}
            </section>

            <section className="mt-8 rounded-3xl border border-card-border bg-card-bg p-6">
              <h2 className="text-xl font-semibold">
                Student reviews
                <span className="ml-2 text-sm font-normal text-foreground opacity-60">
                  ({teacher.reviewCount})
                </span>
              </h2>
              {teacher.reviews?.length ? (
                <div className="mt-4 space-y-3">
                  {teacher.reviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-2xl border border-card-border p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <StarRating value={review.rating} count={1} />
                          <span className="text-sm font-semibold">
                            {review.studentName}
                          </span>
                        </div>
                        <span className="text-xs text-foreground opacity-60">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-3 whitespace-pre-line text-sm">
                          {review.comment}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-2xl border border-dashed border-card-border p-6 text-center text-sm text-foreground opacity-70">
                  No reviews yet. Be the first to learn with this teacher.
                </p>
              )}
            </section>
          </>
        ) : (
          <p className="text-foreground opacity-70">Teacher not found.</p>
        )}
      </div>
    </main>
  );
}
