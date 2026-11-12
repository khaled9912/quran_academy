"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Check, ChevronDown, Loader2, Users } from "lucide-react";
import {
  bookWeeklyLessonsForStudent,
  getPendingStudents,
} from "@/services/onboarding.service";
import { getTeachers } from "@/services/teacher.service";
import { assignStudentToTeacher } from "@/services/assignment.service";
import { getAllTeacherAvailabilityRulesForAdmin } from "@/services/scheduling.service";
import { ApiError } from "@/lib/backend-client";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";
import { useToast } from "@/providers/toast-provider";
import { WEEKDAY_SHORT, formatWeeklyTimeRange } from "@/lib/utils";
import { timeZoneLabel, toViewerWeeklyTime } from "@/lib/weekly-time";
import type {
  PendingStudent,
  StudentWeeklyPreference,
} from "@/types/onboarding";
import type { WeeklyRule } from "@/types/scheduling";

/** Saturday first, the order the academy reads a week in. */
const DAY_ORDER = [6, 0, 1, 2, 3, 4, 5];

/** An unanswered level has to read as unanswered, not as a clipped line. */
const levelWord = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "not given";

const teacherName = (teacher: {
  fullName?: string | null;
  name?: string | null;
  email?: string | null;
}) => teacher.fullName ?? teacher.name ?? teacher.email ?? "Unnamed teacher";

const minutesOf = (time: string) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

/** Two weekly windows on the same clock that share at least one minute. */
interface WeekWindow {
  dayOfWeek: number;
  startsAtTime: string;
  endsAtTime: string;
}

const overlaps = (a: WeekWindow, b: WeekWindow) =>
  a.dayOfWeek === b.dayOfWeek &&
  minutesOf(a.startsAtTime) < minutesOf(b.endsAtTime) &&
  minutesOf(b.startsAtTime) < minutesOf(a.endsAtTime);

const byWeek = (rules: WeeklyRule[]) =>
  [...rules].sort(
    (a, b) =>
      DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek) ||
      a.startsAtTime.localeCompare(b.startsAtTime)
  );

const windowLabel = (rule: WeeklyRule) =>
  `${WEEKDAY_SHORT[rule.dayOfWeek]} ${formatWeeklyTimeRange(
    rule.startsAtTime,
    rule.endsAtTime
  )}`;

const daysAgo = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
};

const preferenceLabel = (slot: StudentWeeklyPreference) =>
  `${WEEKDAY_SHORT[slot.dayOfWeek]} ${formatWeeklyTimeRange(
    slot.startsAtTime,
    slot.endsAtTime
  )}`;

type Offer = {
  dayOfWeek: number;
  startsAtTime: string;
  endsAtTime: string;
  sourceDayOfWeek: number;
  sourceStartsAtTime: string;
  sourceEndsAtTime: string;
  sourceTimeZoneId: string;
  sameZone: boolean;
};

/**
 * Reads a student's offered hours on the teacher's clock — the teacher is the
 * person who has to be awake — and merges consecutive hours into runs, so an
 * evening of eight cells becomes one line to match against a published rule.
 */
const offersInTeacherClock = (
  slots: StudentWeeklyPreference[],
  teacherZone: string | undefined
): Offer[] => {
  if (!teacherZone) return [];

  const converted: Offer[] = slots
    .map((slot) => {
      const local = toViewerWeeklyTime(slot, teacherZone);
      return {
        dayOfWeek: local.dayOfWeek,
        startsAtTime: local.startsAtTime,
        endsAtTime: local.endsAtTime,
        sourceDayOfWeek: local.sourceDayOfWeek,
        sourceStartsAtTime: local.sourceStartsAtTime,
        sourceEndsAtTime: local.sourceEndsAtTime,
        sourceTimeZoneId: local.sourceTimeZoneId,
        sameZone: local.sameZone,
      };
    })
    .sort(
      (a, b) =>
        a.dayOfWeek - b.dayOfWeek ||
        a.startsAtTime.localeCompare(b.startsAtTime)
    );

  const runs: Offer[] = [];
  for (const offer of converted) {
    const last = runs[runs.length - 1];
    if (
      last &&
      last.dayOfWeek === offer.dayOfWeek &&
      last.endsAtTime === offer.startsAtTime
    ) {
      last.endsAtTime = offer.endsAtTime;
      last.sourceEndsAtTime = offer.sourceEndsAtTime;
      continue;
    }
    runs.push(offer);
  }
  return runs;
};

/**
 * The assignment desk: everything a student told us during signup, next to the
 * teacher's open weekly times, so one person can place them in a lesson.
 */
export function AssignmentStudio() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState("");
  const [ruleIds, setRuleIds] = useState<string[]>([]);

  const pendingQuery = useQuery({
    queryKey: ["students", "pending"],
    queryFn: getPendingStudents,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });
  const teachersQuery = useQuery({
    queryKey: ["teachers"],
    queryFn: () => getTeachers(),
  });

  const allRulesQuery = useQuery({
    queryKey: ["admin-teacher-rules"],
    queryFn: getAllTeacherAvailabilityRulesForAdmin,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });

  const waiting = (pendingQuery.data ?? []).filter(
    (student) => !student.hasTeacher
  );
  const teachers = teachersQuery.data ?? [];
  const allRules = allRulesQuery.data ?? [];

  const rulesByTeacher = new Map<string, WeeklyRule[]>();
  for (const rule of allRules) {
    const list = rulesByTeacher.get(rule.teacherId);
    if (list) list.push(rule);
    else rulesByTeacher.set(rule.teacherId, [rule]);
  }

  const rules = byWeek(rulesByTeacher.get(teacherId) ?? []);

  // Every rule a teacher publishes carries the same zone, so the first one
  // answers "what clock does this teacher live on?".
  const teacherZone = rules[0]?.timeZoneId;

  /**
   * Ranked for one student: who can actually cover the hours they offered.
   * Their windows are read on each teacher's own clock, because the teacher is
   * the person who has to be awake for them.
   */
  const rankTeachers = (slots: StudentWeeklyPreference[]) =>
    teachers
      .map((teacher) => {
        const published = byWeek(rulesByTeacher.get(teacher.id) ?? []);
        const offers = offersInTeacherClock(slots, published[0]?.timeZoneId);
        const open = published.filter((rule) => rule.status === "available");
        return {
          teacher,
          published,
          covered: offers.filter((offer) =>
            open.some((rule) => overlaps(rule, offer))
          ).length,
          total: offers.length,
        };
      })
      .sort(
        (a, b) =>
          b.covered - a.covered ||
          Number(b.published.length > 0) - Number(a.published.length > 0) ||
          teacherName(a.teacher).localeCompare(teacherName(b.teacher))
      );

  const chooseTeacher = (id: string) => {
    setTeacherId(id);
    // Rules chosen for the previous teacher belong to that teacher.
    setRuleIds([]);
  };

  const bookMutation = useMutation({
    mutationFn: async (student: PendingStudent) => {
      await assignStudentToTeacher(teacherId, student.studentId);
      if (ruleIds.length)
        await bookWeeklyLessonsForStudent(student.studentId, ruleIds);
    },
    onSuccess: async (_data, student) => {
      showToast(
        ruleIds.length
          ? `${student.studentName ?? "The student"} has a teacher and weekly lessons.`
          : `${student.studentName ?? "The student"} has a teacher. Pick a weekly time to finish.`,
        "success"
      );
      setOpenId(null);
      setTeacherId("");
      setRuleIds([]);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["students", "pending"] }),
        queryClient.invalidateQueries({
          queryKey: ["teacher-student-assignments"],
        }),
      ]);
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) {
        showToast(
          error instanceof Error
            ? error.message
            : "Unable to place this student. Please try again.",
          "error"
        );
      }
    },
  });

  const toggleRule = (ruleId: string) =>
    setRuleIds((current) =>
      current.includes(ruleId)
        ? current.filter((id) => id !== ruleId)
        : [...current, ruleId]
    );

  const openStudent = (studentId: string) => {
    setOpenId((current) => (current === studentId ? null : studentId));
    setTeacherId("");
    setRuleIds([]);
  };

  return (
    <section className="mb-10 rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
      <div className="mb-5 flex items-center gap-3">
        <Users className="text-green-600 dark:text-green-400" />
        <h2 className="text-2xl font-semibold">Waiting for a teacher</h2>
        {waiting.length > 0 && (
          <span className="rounded-full bg-amber-100 dark:bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
            {waiting.length}
          </span>
        )}
      </div>

      {pendingQuery.isLoading ? (
        <p className="text-foreground opacity-70">Loading students…</p>
      ) : pendingQuery.error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
        >
          {pendingQuery.error instanceof Error
            ? pendingQuery.error.message
            : "Unable to load the students waiting for a teacher."}
        </p>
      ) : waiting.length === 0 ? (
        <p className="text-foreground opacity-70">
          Everyone has a teacher. New signups appear here as soon as they finish
          their setup.
        </p>
      ) : (
        <div className="space-y-4">
          {waiting.map((student) => {
            const slots = student.onboarding?.weeklySlots ?? [];
            const planDays = student.onboarding?.planDaysPerWeek ?? 0;
            const isOpen = openId === student.studentId;
            return (
              <article
                key={student.studentId}
                className="rounded-2xl border border-card-border p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold">
                      {student.studentName || student.email}
                    </p>
                    <p className="text-sm text-foreground opacity-70">
                      {student.email} · signed up{" "}
                      {daysAgo(student.registeredAt)}
                      {" · "}
                      {student.onboarding?.completedAt
                        ? `setup finished ${daysAgo(student.onboarding.completedAt)}`
                        : "setup not finished"}
                    </p>
                    <p className="mt-2 text-sm">
                      <span className="text-foreground opacity-70">
                        Level:{" "}
                      </span>
                      <span className="font-semibold">
                        Quran {levelWord(student.onboarding?.quranLevel ?? "")}
                        {" · "}Tajweed{" "}
                        {levelWord(student.onboarding?.tajweedLevel ?? "")}
                        {" · "}Studies{" "}
                        {levelWord(
                          student.onboarding?.islamicStudiesLevel ?? ""
                        )}
                        {" · "}Arabic{" "}
                        {levelWord(student.onboarding?.arabicLevel ?? "")}
                      </span>
                    </p>
                    {slots.length > 0 || planDays > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {planDays > 0 && (
                          <span className="rounded-full border border-green-500/60 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-300">
                            Wants {planDays}{" "}
                            {planDays === 1 ? "day" : "days"} a week
                          </span>
                        )}
                        {slots.map((slot) => (
                          <span
                            key={slot.id}
                            className="rounded-full border border-card-border px-3 py-1 text-xs font-semibold"
                          >
                            {preferenceLabel(slot)}{" "}
                            <span className="font-normal opacity-70">
                              {timeZoneLabel(slot.timeZoneId)}
                            </span>
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {slots.length === 0 && (
                      <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
                        No times given yet — ask them to complete their setup.
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => openStudent(student.studentId)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-green-500 px-4 py-2 text-sm font-semibold text-green-600 transition hover:bg-green-500 hover:text-white dark:text-green-400"
                  >
                    <CalendarPlus size={15} />
                    {isOpen ? "Close" : "Assign & book"}
                    <ChevronDown
                      size={15}
                      className={`transition ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                {isOpen && (
                  <div className="rise-in mt-5 border-t border-card-border pt-5">
                    <div className="grid gap-4 md:grid-cols-[minmax(0,22rem)_1fr]">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-foreground opacity-60">
                          {slots.length
                            ? "Teachers, best match first"
                            : "Choose a teacher"}
                        </p>
                        {allRulesQuery.error ? (
                          <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                            Teacher times could not be loaded, so nobody is
                            ranked. You can still assign a teacher.
                          </p>
                        ) : null}
                        {teachersQuery.isLoading || allRulesQuery.isLoading ? (
                          <p className="mt-3 inline-flex items-center gap-2 text-sm text-foreground opacity-70">
                            <Loader2 size={15} className="animate-spin" />
                            Loading teachers and their times…
                          </p>
                        ) : teachers.length === 0 ? (
                          <p className="mt-3 text-sm text-foreground opacity-70">
                            No active teachers yet.
                          </p>
                        ) : (
                          <ul className="mt-3 max-h-96 space-y-2 overflow-y-auto pr-1">
                            {rankTeachers(slots).map(
                              ({ teacher, published, covered, total }) => {
                                const chosen = teacherId === teacher.id;
                                const open = published.filter(
                                  (rule) => rule.status === "available"
                                );
                                return (
                                  <li key={teacher.id}>
                                    <button
                                      type="button"
                                      aria-pressed={chosen}
                                      onClick={() => chooseTeacher(teacher.id)}
                                      className={`w-full rounded-xl border p-3 text-left transition ${
                                        chosen
                                          ? "border-green-600 bg-green-500/10 dark:border-green-500"
                                          : "border-card-border hover:border-green-500"
                                      }`}
                                    >
                                      <span className="flex items-center justify-between gap-2">
                                        <span className="flex min-w-0 items-center gap-1.5 font-semibold">
                                          {chosen && (
                                            <Check
                                              size={14}
                                              className="shrink-0 text-green-600 dark:text-green-400"
                                            />
                                          )}
                                          <span className="truncate">
                                            {teacherName(teacher)}
                                          </span>
                                        </span>
                                        {total > 0 && (
                                          <span
                                            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                              covered === 0
                                                ? "border border-card-border text-foreground opacity-70"
                                                : covered === total
                                                  ? "bg-green-500/15 text-green-700 dark:text-green-300"
                                                  : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
                                            }`}
                                          >
                                            {covered === 0
                                              ? "no time matches"
                                              : covered === total
                                                ? `covers all ${total}`
                                                : `covers ${covered} of ${total}`}
                                          </span>
                                        )}
                                      </span>
                                      <span className="mt-1 block truncate text-xs text-foreground opacity-70">
                                        {open.length
                                          ? open.map(windowLabel).join(" · ")
                                          : published.length
                                            ? "Every weekly time is taken"
                                            : "No weekly times published yet"}
                                      </span>
                                    </button>
                                  </li>
                                );
                              }
                            )}
                          </ul>
                        )}
                      </div>
                      <div>
                        {teacherZone && slots.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-foreground opacity-60">
                              Their hours on the {timeZoneLabel(teacherZone)}{" "}
                              clock
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {offersInTeacherClock(slots, teacherZone).map(
                                (offer) => (
                                  <span
                                    key={`${offer.dayOfWeek}-${offer.startsAtTime}`}
                                    className="rounded-full border border-card-border px-3 py-1 text-xs font-semibold"
                                  >
                                    {WEEKDAY_SHORT[offer.dayOfWeek]}{" "}
                                    {formatWeeklyTimeRange(
                                      offer.startsAtTime,
                                      offer.endsAtTime
                                    )}
                                    {!offer.sameZone && (
                                      <span className="ml-2 font-normal opacity-70">
                                        {WEEKDAY_SHORT[offer.sourceDayOfWeek]}{" "}
                                        {formatWeeklyTimeRange(
                                          offer.sourceStartsAtTime,
                                          offer.sourceEndsAtTime
                                        )}{" "}
                                        in{" "}
                                        {timeZoneLabel(offer.sourceTimeZoneId)}
                                      </span>
                                    )}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                        {!teacherId ? (
                          <p className="text-sm text-foreground opacity-70">
                            Choose a teacher to see their open weekly times.
                          </p>
                        ) : allRulesQuery.isLoading ? (
                          <p className="inline-flex items-center gap-2 text-sm text-foreground opacity-70">
                            <Loader2 size={15} className="animate-spin" />
                            Loading their times…
                          </p>
                        ) : rules.length === 0 ? (
                          <p className="text-sm text-foreground opacity-70">
                            This teacher has no weekly times published yet.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {rules.map((rule) => {
                              const chosen = ruleIds.includes(rule.id);
                              const taken = rule.status !== "available";
                              return (
                                <button
                                  key={rule.id}
                                  type="button"
                                  aria-pressed={chosen}
                                  disabled={taken}
                                  onClick={() => toggleRule(rule.id)}
                                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                                    chosen
                                      ? "border-green-600 bg-green-500/15 text-green-700 dark:text-green-300"
                                      : taken
                                        ? "cursor-not-allowed border-card-border opacity-40"
                                        : "border-card-border hover:border-green-500"
                                  }`}
                                >
                                  {WEEKDAY_SHORT[rule.dayOfWeek]}{" "}
                                  {formatWeeklyTimeRange(
                                    rule.startsAtTime,
                                    rule.endsAtTime
                                  )}
                                  {taken && (
                                    <span className="ml-2 text-xs font-normal opacity-70">
                                      taken
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!teacherId || bookMutation.isPending}
                      onClick={() => bookMutation.mutate(student)}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {bookMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CalendarPlus size={16} />
                      )}
                      {ruleIds.length
                        ? `Assign and book ${ruleIds.length} weekly ${
                            ruleIds.length === 1 ? "lesson" : "lessons"
                          }`
                        : "Assign teacher only"}
                    </button>
                    <p className="mt-3 text-sm text-foreground opacity-70">
                      Both get a notice as soon as you confirm.
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
