"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Languages,
  Moon,
  ScrollText,
} from "lucide-react";
import { getMyOnboarding, saveMyOnboarding } from "@/services/onboarding.service";
import { getAssignedWeeklyAvailability } from "@/services/scheduling.service";
import { useAuth } from "@/providers/auth-provider";
import { clearPlanChoice, readPlanChoice } from "@/lib/plan-choice";
import { reportUnexpectedError } from "@/lib/sentry";
import { getViewerTimeZone, timeZoneLabel } from "@/lib/weekly-time";
import { plans } from "@/lib/plans";
import { PolicyPrompt } from "@/components/PolicyPrompt";
import { WEEKDAY_SHORT, formatTimeOfDay } from "@/lib/utils";
import type { StudentLevel } from "@/types/onboarding";

const LEVELS: { value: StudentLevel; label: string; hint: string }[] = [
  { value: "beginner", label: "Beginner", hint: "Just starting out" },
  {
    value: "intermediate",
    label: "Intermediate",
    hint: "Comfortable, still learning",
  },
  { value: "advanced", label: "Advanced", hint: "Confident and steady" },
];

const SUBJECTS = [
  {
    key: "quranLevel",
    title: "Quran reading",
    hint: "Reading the Arabic text of the Quran aloud.",
    icon: BookOpen,
  },
  {
    key: "tajweedLevel",
    title: "Tajweed",
    hint: "The rules of how Quranic letters are pronounced.",
    icon: ScrollText,
  },
  {
    key: "islamicStudiesLevel",
    title: "Islamic studies",
    hint: "Basics of faith, worship and manners.",
    icon: Moon,
  },
  {
    key: "arabicLevel",
    title: "Arabic",
    hint: "The Arabic language: vocabulary and grammar.",
    icon: Languages,
  },
] as const;

type LevelKey = (typeof SUBJECTS)[number]["key"];

const STEP_LABELS = ["Your level", "Your plan", "Your times"];

/**
 * The tier decides how many days the week has to hold, so it is asked before
 * the grid. These are the tiers /plans sells and the API accepts. Prices stay
 * on /plans: they are hidden from some countries, and the academy never quotes
 * a figure inside setup.
 */
const PLAN_OPTIONS = plans.map((plan) => ({
  daysPerWeek: plan.daysPerWeek,
  hint: `${plan.classesPerMonth} classes a month`,
}));

const DAY_ORDER: number[] = [6, 0, 1, 2, 3, 4, 5];
const STUDENT_DURATION_MINUTES = 30;

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

const buildStudentWeeklySlots = (days: number[], startsAtTime: string) =>
  days.map((dayOfWeek) => ({
    dayOfWeek,
    startsAtTime,
    endsAtTime: addMinutes(startsAtTime, STUDENT_DURATION_MINUTES),
  }));

export default function StudentOnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const viewerTimeZone = getViewerTimeZone();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const [levels, setLevels] = useState<Record<LevelKey, StudentLevel | "">>({
    quranLevel: "",
    tajweedLevel: "",
    islamicStudiesLevel: "",
    arabicLevel: "",
  });
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [preferredStart, setPreferredStart] = useState("17:00");
  const [planDays, setPlanDays] = useState(0);
  const [saving, setSaving] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endTime = useMemo(
    () => addMinutes(preferredStart, STUDENT_DURATION_MINUTES),
    [preferredStart]
  );
  const onboardingQuery = useQuery({
    queryKey: ["onboarding", "student"],
    queryFn: getMyOnboarding,
    enabled: role === "student",
  });
  const assignedQuery = useQuery({
    queryKey: ["availability", "student"],
    queryFn: getAssignedWeeklyAvailability,
    enabled: role === "student",
  });

  // Resume wherever the student stopped rather than replaying step one.
  const hydrated = useRef(false);
  useEffect(() => {
    if (onboardingQuery.isLoading || hydrated.current) return;
    hydrated.current = true;
    const saved = onboardingQuery.data;
    // A tier tapped on /plans is the student's first answer, so setup opens
    // with it already chosen — before an account exists it is kept on the
    // device, and afterwards it comes back from the academy's own record.
    const tappedOnPlans = readPlanChoice();
    if (!saved) {
      setPlanDays(tappedOnPlans);
      return;
    }
    setLevels({
      quranLevel: saved.quranLevel as StudentLevel,
      tajweedLevel: saved.tajweedLevel as StudentLevel,
      islamicStudiesLevel: saved.islamicStudiesLevel as StudentLevel,
      arabicLevel: saved.arabicLevel as StudentLevel,
    });
    setSelectedDays(Array.from(new Set(saved.weeklySlots.map((slot) => slot.dayOfWeek))));
    if (saved.weeklySlots.length > 0) setPreferredStart(saved.weeklySlots[0].startsAtTime);
    setPlanDays(saved.planDaysPerWeek || tappedOnPlans);
    if (saved.completedAt) return;
    // Resume at the first question still unanswered, so a student who only ever
    // said how often they want to learn is not sent back through the levels.
    if (SUBJECTS.some((subject) => !saved[subject.key])) setStep(0);
    else if (!saved.planDaysPerWeek) setStep(1);
    else setStep(2);
  }, [onboardingQuery.data, onboardingQuery.isLoading]);

  useEffect(
    () => () => {
      if (swapTimer.current) clearTimeout(swapTimer.current);
    },
    []
  );

  const goTo = useCallback(
    (next: number, dir: 1 | -1) => {
      if (next === step) return;
      setDirection(dir);
      setPhase("out");
      if (swapTimer.current) clearTimeout(swapTimer.current);
      swapTimer.current = setTimeout(() => {
        setStep(next);
        setPhase("in");
        swapTimer.current = setTimeout(() => setPhase("idle"), 340);
      }, 190);
    },
    [step]
  );

  const levelsComplete = SUBJECTS.every((subject) => levels[subject.key]);
  const offeredDays = selectedDays.length;
  // The week has to be able to hold the plan they asked for.
  const timesFitPlan = planDays > 0 && offeredDays >= planDays;
  const canFinish = levelsComplete && timesFitPlan;

  // The dashboard sends a student who has not finished setup straight back here,
  // so the link would only bounce them. It appears once leaving actually lands.
  const canLeaveSetup =
    Boolean(assignedQuery.data?.teacher) ||
    Boolean(onboardingQuery.data?.completedAt);

  const toggleDay = (day: number) => {
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day]
    );
  };

  const summary = selectedDays.length
    ? `${selectedDays
        .slice()
        .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))
        .map((day) => WEEKDAY_SHORT[day])
        .join(", ")} · ${formatTimeOfDay(preferredStart)} – ${formatTimeOfDay(endTime)}`
    : "Choose the days you could take a lesson.";

  const draft = useCallback(
    (completed: boolean) => ({
      quranLevel: levels.quranLevel,
      tajweedLevel: levels.tajweedLevel,
      islamicStudiesLevel: levels.islamicStudiesLevel,
      arabicLevel: levels.arabicLevel,
      timeZoneId: viewerTimeZone,
      daysPerWeek: planDays || null,
      weeklySlots: buildStudentWeeklySlots(selectedDays, preferredStart),
      completed,
    }),
    [levels, planDays, preferredStart, selectedDays, viewerTimeZone]
  );

  const handleContinue = async (next: number) => {
    // A jump across the header checks every question it steps over, not just
    // the one on screen.
    if (next > 0 && !levelsComplete) return;
    if (next > 1 && planDays === 0) return;
    // A partial save keeps the answers on record if the student closes the tab.
    try {
      await saveMyOnboarding(draft(false));
      clearPlanChoice();
    } catch (error) {
      reportUnexpectedError(error);
    }
    goTo(next, 1);
  };

  /** Back is always free; forward goes through the same save as Continue. */
  const stepTo = (next: number) => {
    if (next === step) return;
    if (next > step) {
      void handleContinue(next);
      return;
    }
    goTo(next, -1);
  };

  const handleSubmit = async () => {
    if (!canFinish || saving) return;
    setSaving(true);
    try {
      await saveMyOnboarding(draft(true));
      clearPlanChoice();
      queryClient.setQueryData(["onboarding", "student"], {
        ...(onboardingQuery.data ?? {}),
        ...draft(true),
        planDaysPerWeek: planDays,
        weeklySlots: buildStudentWeeklySlots(selectedDays, preferredStart).map((slot, index) => ({
          id: String(index),
          ...slot,
          timeZoneId: viewerTimeZone,
        })),
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setCelebrating(true);
    } catch (error) {
      reportUnexpectedError(error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!celebrating) return;
    const timer = setTimeout(() => router.replace("/student/dashboard"), 1700);
    return () => clearTimeout(timer);
  }, [celebrating, router]);

  const stepClass =
    phase === "out"
      ? direction === 1
        ? "step-out"
        : "step-back-out"
      : phase === "in"
        ? direction === 1
          ? "step-in"
          : "step-back-in"
        : "";

  const zoneHint = useMemo(() => {
    const offset = new Intl.DateTimeFormat("en-US", {
      timeZone: viewerTimeZone,
      timeZoneName: "shortOffset",
    })
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")?.value;
    return `${timeZoneLabel(viewerTimeZone)}${offset ? ` (${offset})` : ""}`;
  }, [viewerTimeZone]);

  if (celebrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-24 pb-16 text-foreground">
        <div className="w-full max-w-md rounded-3xl border border-card-bg bg-card-bg p-10 text-center">
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
            <span className="halo absolute inset-0 rounded-full bg-green-500/40" />
            <span
              className="halo absolute inset-0 rounded-full bg-green-500/30"
              style={{ animationDelay: "0.5s" }}
            />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-500">
              <svg
                viewBox="0 0 24 24"
                className="h-10 w-10"
                fill="none"
                stroke="white"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path className="draw-check" d="M20 6 9 17l-5-5" />
              </svg>
            </span>
          </div>
          <h1 className="mt-6 text-2xl font-bold">You are all set</h1>
          <p className="mt-2 text-foreground opacity-75">
            Our team is matching you with the right teacher now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pt-24 pb-16 text-foreground">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center gap-4">
          {canLeaveSetup && (
            <Link
              href="/student/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"
            >
              <ArrowLeft size={15} /> Back to my dashboard
            </Link>
          )}
          <span className="ml-auto text-sm text-foreground opacity-60">
            Step {step + 1} of {STEP_LABELS.length}
          </span>
        </div>

        <div className="space-y-4">
          <PolicyPrompt />

          <div className="pt-1">
            <div className="flex items-center gap-3">
            {STEP_LABELS.map((label, index) => {
              // Any step already answered is one tap away; a later question
              // stays out of reach until the one before it has an answer.
              const reachable =
                index <= step ||
                (levelsComplete && (index === 1 || planDays > 0));
              return (
                <div key={label} className="flex flex-1 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => stepTo(index)}
                    disabled={!reachable}
                    aria-current={index === step ? "step" : undefined}
                    className={`flex items-center gap-3 ${
                      reachable ? "hover:opacity-80" : "cursor-not-allowed"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                        index < step
                          ? "bg-green-500 text-white"
                          : index === step
                            ? "bg-green-500/15 text-green-700 ring-2 ring-green-500 dark:text-green-400"
                            : "bg-foreground/10 text-foreground opacity-50"
                      }`}
                    >
                      {index < step ? <Check size={14} /> : index + 1}
                    </span>
                    <span
                      className={`text-sm font-semibold transition-colors duration-300 ${
                        index === step
                          ? "text-foreground"
                          : "text-foreground opacity-50"
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                  {index < STEP_LABELS.length - 1 && (
                    <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-foreground/10">
                      <span
                        className="absolute inset-y-0 left-0 rounded-full bg-green-500 transition-all duration-500 ease-out"
                        style={{ width: step > index ? "100%" : "0%" }}
                      />
                    </span>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        </div>

        <div
          className={`mt-6 rounded-3xl border border-card-border bg-card-bg p-6 md:p-10 ${stepClass}`}
        >
          {onboardingQuery.isLoading ? (
            <div className="space-y-4">
              <div className="h-8 w-2/3 animate-pulse rounded-xl bg-foreground/10" />
              <div className="h-4 w-full animate-pulse rounded-lg bg-foreground/10" />
              <div className="mt-10 space-y-4">
                {[0, 1, 2].map((row) => (
                  <div
                    key={row}
                    className="h-24 animate-pulse rounded-2xl bg-foreground/10"
                  />
                ))}
              </div>
            </div>
          ) : step === 0 ? (
            <>
              <h1 className="text-3xl font-bold">
                Where are you starting from?
              </h1>
              <p className="mt-2 text-lg text-foreground opacity-75">
                Pick the level that fits you today in each subject. Your teacher
                uses this to plan your lessons — nothing here is a test.
              </p>

              <div className="mt-8 space-y-4">
                {SUBJECTS.map((subject, index) => {
                  const Icon = subject.icon;
                  const chosen = levels[subject.key];
                  return (
                    <div
                      key={subject.key}
                      className="rise-in rounded-2xl border border-card-border bg-background p-5"
                      style={{ animationDelay: `${120 + index * 90}ms` }}
                    >
                      <div className="flex flex-wrap items-start gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">
                          <Icon size={20} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-lg font-semibold">
                            {subject.title}
                          </h2>
                          <p className="mt-0.5 text-sm text-foreground opacity-70">
                            {subject.hint}
                          </p>
                        </div>
                      </div>

                      <div
                        className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3"
                        role="group"
                        aria-label={`${subject.title} level`}
                      >
                        {LEVELS.map((level) => {
                          const isChosen = chosen === level.value;
                          return (
                            <button
                              key={level.value}
                              type="button"
                              aria-pressed={isChosen}
                              onClick={() =>
                                setLevels((current) => ({
                                  ...current,
                                  [subject.key]: level.value,
                                }))
                              }
                              className={`rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${
                                isChosen
                                  ? "border-green-500 bg-green-500 text-white shadow-sm"
                                  : "border-card-border bg-card-bg hover:border-green-500 hover:bg-green-500/10"
                              }`}
                            >
                              <span
                                className={`block text-sm font-semibold ${
                                  isChosen ? "" : "text-foreground"
                                }`}
                              >
                                {level.label}
                              </span>
                              <span
                                className={`mt-0.5 block text-xs ${
                                  isChosen
                                    ? "text-white/85"
                                    : "text-foreground opacity-60"
                                }`}
                              >
                                {level.hint}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-foreground opacity-70">
                  {SUBJECTS.filter((subject) => levels[subject.key]).length} of{" "}
                  {SUBJECTS.length} chosen
                </p>
                <button
                  type="button"
                  onClick={() => void handleContinue(1)}
                  disabled={!levelsComplete}
                  className="group inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue
                  <ArrowRight
                    size={17}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </button>
              </div>
            </>
          ) : step === 1 ? (
            <>
              <h1 className="text-3xl font-bold">
                How often do you want to learn?
              </h1>
              <p className="mt-2 text-lg text-foreground opacity-75">
                Pick the days each week you would like a lesson. It sets how
                many times the academy looks for — nothing is charged until a
                lesson actually takes place.
              </p>

              <div
                className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2"
                role="group"
                aria-label="Lessons per week"
              >
                {PLAN_OPTIONS.map((option, index) => {
                  const chosen = planDays === option.daysPerWeek;
                  return (
                    <button
                      key={option.daysPerWeek}
                      type="button"
                      aria-pressed={chosen}
                      onClick={() => setPlanDays(option.daysPerWeek)}
                      className={`rise-in rounded-2xl border px-5 py-4 text-left transition-all duration-200 ${
                        chosen
                          ? "border-green-500 bg-green-500 text-white shadow-sm"
                          : "border-card-border bg-background hover:border-green-500 hover:bg-green-500/10"
                      }`}
                      style={{ animationDelay: `${120 + index * 90}ms` }}
                    >
                      <span
                        className={`block text-lg font-semibold ${chosen ? "" : "text-foreground"}`}
                      >
                        {option.daysPerWeek} days a week
                      </span>
                      <span
                        className={`mt-0.5 block text-sm ${chosen ? "text-white/85" : "text-foreground opacity-60"}`}
                      >
                        {option.hint}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-6 text-sm text-foreground opacity-70">
                {planDays
                  ? `Your week will need ${planDays} different ${
                      planDays === 1 ? "day" : "days"
                    }.`
                  : "Choose how many days a week."}{" "}
                Prices and what is included are on the{" "}
                <Link
                  href="/plans"
                  className="text-green-600 underline-offset-2 hover:underline dark:text-green-400"
                >
                  plans page
                </Link>
                . You can change this whenever the family needs it.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => goTo(0, -1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-card-border px-5 py-3 font-semibold transition hover:border-green-500"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => void handleContinue(2)}
                  disabled={planDays === 0}
                  className="group inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue
                  <ArrowRight
                    size={17}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold">
                When could you take a lesson?
              </h1>
              <p className="mt-2 text-lg text-foreground opacity-75">
                Pick the weekdays and start time that usually work for you. Each
                weekly window is a 30-minute lesson, and the academy uses this to
                match you with a suitable teacher.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full border border-card-border bg-background px-3 py-1.5 text-foreground opacity-80">
                  Your time zone: {zoneHint}
                </span>
                <span
                  className={`rounded-full px-3 py-1.5 font-semibold transition-colors ${
                    selectedDays.length
                      ? "bg-green-500 text-white"
                      : "bg-foreground/10 text-foreground opacity-60"
                  }`}
                >
                  {selectedDays.length} {selectedDays.length === 1 ? "day" : "days"}{" "}
                  selected
                </span>
                <span
                  className={`rounded-full border px-3 py-1.5 font-semibold transition-colors ${
                    timesFitPlan
                      ? "border-green-500 text-green-700 dark:text-green-400"
                      : "border-card-border text-foreground opacity-60"
                  }`}
                >
                  {offeredDays} of {planDays} days free
                </span>
                {selectedDays.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedDays([])}
                    className="text-foreground opacity-60 underline-offset-2 hover:text-green-600 hover:underline dark:hover:text-green-400"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-3xl border border-card-border bg-card-bg p-5 shadow-sm">
                  <fieldset>
                    <legend className="text-sm font-semibold">Days</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {DAY_ORDER.map((day) => {
                        const chosen = selectedDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            aria-pressed={chosen}
                            onClick={() => toggleDay(day)}
                            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                              chosen
                                ? "border-green-700 bg-green-500/15 text-green-900 dark:border-green-400 dark:text-green-300"
                                : "border-card-border bg-background text-foreground/60 hover:border-green-500"
                            }`}
                          >
                            {WEEKDAY_SHORT[day]}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-semibold">
                      Starts at
                      <input
                        type="time"
                        value={preferredStart}
                        onChange={(event) => setPreferredStart(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-card-border bg-background px-3 py-3 font-normal text-foreground outline-none focus:border-green-500"
                      />
                    </label>

                    <div className="rounded-2xl border border-card-border bg-background p-3">
                      <p className="text-sm font-semibold">Length</p>
                      <div className="mt-2 inline-flex rounded-xl border border-green-700 bg-green-500/15 px-3 py-2 text-sm font-semibold text-green-900 dark:border-green-400 dark:text-green-300">
                        30 minutes
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-green-500/10 p-4 text-sm">
                    <p className="font-semibold">{summary}</p>
                    <p className="mt-1 text-xs text-foreground/60">
                      Repeats every week · times are in {zoneHint}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-card-border bg-card-bg p-5 shadow-sm">
                  <h2 className="text-xl font-bold">Your preferred lesson window</h2>
                  {selectedDays.length ? (
                    <div className="mt-4 space-y-3">
                      {selectedDays
                        .slice()
                        .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))
                        .map((day) => (
                          <div
                            key={day}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-card-border bg-background p-3"
                          >
                            <div>
                              <p className="font-semibold">{WEEKDAY_SHORT[day]}</p>
                              <p className="text-sm text-foreground/60">
                                {formatTimeOfDay(preferredStart)} – {formatTimeOfDay(endTime)}
                              </p>
                            </div>
                            <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-700 dark:text-green-300">
                              30 min
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="mt-4 rounded-xl border border-dashed border-card-border p-8 text-center text-sm text-foreground/60">
                      Choose the weekday(s) and start time that fit your family.
                    </p>
                  )}
                </div>
              </div>

              <p className="mt-4 text-sm text-foreground opacity-70">
                These are preferences, not bookings. The academy uses them to
                find your teacher and set your weekly time — you will confirm
                nothing else after this.
              </p>

              {offeredDays < planDays && (
                <p
                  role="status"
                  className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
                >
                  Your plan is {planDays} {planDays === 1 ? "day" : "days"} a
                  week and you have offered {offeredDays}{" "}
                  {offeredDays === 1 ? "day" : "days"}. Add{" "}
                  {planDays - offeredDays} more{" "}
                  {planDays - offeredDays === 1 ? "day" : "days"}, or go back
                  and pick a smaller plan.
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => goTo(1, -1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-card-border px-5 py-3 font-semibold transition hover:border-green-500"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={!canFinish || saving}
                  className="group inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? "Sending…" : "Find my teacher"}
                  {!saving && (
                    <ArrowRight
                      size={17}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {assignedQuery.data?.teacher && (
          <p className="mt-6 text-center text-sm text-foreground opacity-70">
            You already have a teacher. Changing these times does not move your
            schedule — it tells the academy what suits you.
          </p>
        )}
      </div>
    </div>
  );
}
