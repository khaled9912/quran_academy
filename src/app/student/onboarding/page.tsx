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
import {
  AvailabilityGrid,
  keysFromPreferences,
  slotKey,
  slotsFromKeys,
} from "@/components/student/AvailabilityGrid";
import { getMyOnboarding, saveMyOnboarding } from "@/services/onboarding.service";
import { getAssignedWeeklyAvailability } from "@/services/scheduling.service";
import { useAuth } from "@/providers/auth-provider";
import { reportUnexpectedError } from "@/lib/sentry";
import { getViewerTimeZone, timeZoneLabel } from "@/lib/weekly-time";
import type { StudentLevel } from "@/types/onboarding";

const LEVELS: { value: StudentLevel; label: string; hint: string }[] = [
  { value: "beginner", label: "Beginner", hint: "Just starting out" },
  { value: "intermediate", label: "Intermediate", hint: "Comfortable, still learning" },
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

const STEP_LABELS = ["Your level", "Your times"];

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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const saved = onboardingQuery.data;
    if (!saved || hydrated.current) return;
    hydrated.current = true;
    setLevels({
      quranLevel: saved.quranLevel as StudentLevel,
      tajweedLevel: saved.tajweedLevel as StudentLevel,
      islamicStudiesLevel: saved.islamicStudiesLevel as StudentLevel,
      arabicLevel: saved.arabicLevel as StudentLevel,
    });
    setSelected(keysFromPreferences(saved.weeklySlots));
    if (!saved.completedAt && saved.weeklySlots.length === 0) setStep(0);
    else if (!saved.completedAt) setStep(1);
  }, [onboardingQuery.data]);

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
  const canFinish = levelsComplete && selected.size > 0;

  // The dashboard sends a student who has not finished setup straight back here,
  // so the link would only bounce them. It appears once leaving actually lands.
  const canLeaveSetup =
    Boolean(assignedQuery.data?.teacher) ||
    Boolean(onboardingQuery.data?.completedAt);

  const toggleSlot = useCallback((key: string, next: boolean) => {
    setSelected((current) => {
      const updated = new Set(current);
      if (next) updated.add(key);
      else updated.delete(key);
      return updated;
    });
  }, []);

  const draft = useCallback(
    (completed: boolean) => ({
      quranLevel: levels.quranLevel,
      tajweedLevel: levels.tajweedLevel,
      islamicStudiesLevel: levels.islamicStudiesLevel,
      arabicLevel: levels.arabicLevel,
      timeZoneId: viewerTimeZone,
      weeklySlots: slotsFromKeys(selected),
      completed,
    }),
    [levels, selected, viewerTimeZone]
  );

  const handleContinue = async () => {
    if (!levelsComplete) return;
    // A partial save keeps the answers on record if the student closes the tab.
    try {
      await saveMyOnboarding(draft(false));
    } catch (error) {
      reportUnexpectedError(error);
    }
    goTo(1, 1);
  };

  const handleSubmit = async () => {
    if (!canFinish || saving) return;
    setSaving(true);
    try {
      await saveMyOnboarding(draft(true));
      queryClient.setQueryData(["onboarding", "student"], {
        ...(onboardingQuery.data ?? {}),
        ...draft(true),
        weeklySlots: slotsFromKeys(selected).map((slot, index) => ({
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
    const timer = setTimeout(
      () => router.replace("/student/dashboard"),
      1700
    );
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
            Step {step + 1} of 2
          </span>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            {STEP_LABELS.map((label, index) => (
              <div key={label} className="flex flex-1 items-center gap-3">
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
                {index === 0 && (
                  <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-foreground/10">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-green-500 transition-all duration-500 ease-out"
                      style={{ width: step > 0 ? "100%" : "0%" }}
                    />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          className={`rounded-3xl border border-card-border bg-card-bg p-6 md:p-10 ${stepClass}`}
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
              <h1 className="text-3xl font-bold">Where are you starting from?</h1>
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
                          <h2 className="text-lg font-semibold">{subject.title}</h2>
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
                  onClick={() => void handleContinue()}
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
          ) : (
            <>
              <h1 className="text-3xl font-bold">When could you take a lesson?</h1>
              <p className="mt-2 text-lg text-foreground opacity-75">
                Tap every hour that usually works for you.
                <span className="hidden sm:inline">
                  {" "}
                  Drag across the grid to select a run of times.
                </span>
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full border border-card-border bg-background px-3 py-1.5 text-foreground opacity-80">
                  Your time zone: {zoneHint}
                </span>
                <span
                  className={`rounded-full px-3 py-1.5 font-semibold transition-colors ${
                    selected.size
                      ? "bg-green-500 text-white"
                      : "bg-foreground/10 text-foreground opacity-60"
                  }`}
                >
                  {selected.size} {selected.size === 1 ? "time" : "times"} selected
                </span>
                {selected.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    className="text-foreground opacity-60 underline-offset-2 hover:text-green-600 hover:underline dark:hover:text-green-400"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-card-border bg-background p-4">
                <AvailabilityGrid
                  selected={selected}
                  onToggle={toggleSlot}
                  disabled={saving}
                />
              </div>

              <p className="mt-4 text-sm text-foreground opacity-70">
                These are preferences, not bookings. The academy uses them to
                find your teacher and set your weekly time — you will confirm
                nothing else after this.
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
