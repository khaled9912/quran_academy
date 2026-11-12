"use client";

import Link from "next/link";
import { Check, Clock3, GraduationCap, MessageSquare } from "lucide-react";
import type { StudentOnboarding } from "@/types/onboarding";
import { WEEKDAY_SHORT } from "@/lib/utils";

const levelWord = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "Not given";

interface PendingAssignmentProps {
  onboarding: StudentOnboarding | null;
}

/**
 * The waiting room. A student who has finished onboarding has done everything
 * asked of them, so this reads as progress rather than a broken account.
 */
export function PendingAssignment({ onboarding }: PendingAssignmentProps) {
  const slots = onboarding?.weeklySlots ?? [];
  const days = Array.from(new Set(slots.map((slot) => slot.dayOfWeek))).sort(
    (a, b) => a - b
  );

  const steps = [
    {
      label: "Account created",
      detail: "You are signed in and ready.",
      done: true,
    },
    {
      label: "Your level",
      detail: onboarding
        ? [
            ["Quran", onboarding.quranLevel],
            ["Tajweed", onboarding.tajweedLevel],
            ["Studies", onboarding.islamicStudiesLevel],
            ["Arabic", onboarding.arabicLevel],
          ]
            .map(([subject, level]) => `${subject} ${levelWord(level)}`)
            .join(" · ")
        : "Not given yet.",
      done: Boolean(onboarding),
    },
    {
      label: "Your available times",
      detail: slots.length
        ? `${slots.length} ${
            slots.length === 1 ? "window" : "windows"
          } on ${days.map((day) => WEEKDAY_SHORT[day]).join(", ")}`
        : "None given yet.",
      done: slots.length > 0,
    },
  ];

  return (
    <div className="rounded-3xl border border-card-border bg-card-bg p-6 md:p-10">
      <div className="flex flex-col items-center text-center">
        <span className="relative flex h-20 w-20 items-center justify-center">
          <span className="halo absolute inset-0 rounded-full bg-green-500/30" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 text-green-600 dark:text-green-400">
            <GraduationCap size={30} />
          </span>
        </span>
        <h1 className="mt-5 text-3xl font-bold">
          We are assigning you the right teacher
        </h1>
        <p className="mt-2 max-w-xl text-lg text-foreground opacity-75">
          Our team is matching your level and your times with a teacher who has
          room for you. This usually takes a day or two.
        </p>
      </div>

      <ul className="mt-8 space-y-3">
        {steps.map((step, index) => (
          <li
            key={step.label}
            className="rise-in flex items-start gap-4 rounded-2xl border border-card-border bg-background p-4"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                step.done
                  ? "bg-green-500 text-white"
                  : "bg-foreground/10 text-foreground opacity-50"
              }`}
            >
              {step.done ? (
                <Check size={15} />
              ) : (
                <Clock3 size={14} className="breathe" />
              )}
            </span>
            <div className="min-w-0">
              <p className="font-semibold">{step.label}</p>
              <p className="mt-0.5 text-sm text-foreground opacity-70">
                {step.detail}
              </p>
            </div>
          </li>
        ))}

        <li
          className="rise-in flex items-start gap-4 rounded-2xl border border-dashed border-green-500/50 bg-green-500/5 p-4"
          style={{ animationDelay: "270ms" }}
        >
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-600 dark:text-green-400">
            <Clock3 size={15} className="breathe" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold">Your teacher and weekly time</p>
            <p className="mt-0.5 text-sm text-foreground opacity-70">
              You will get a notice the moment it is set, and your dashboard
              will show your first lesson.
            </p>
          </div>
        </li>
      </ul>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/student/onboarding"
          className="inline-flex items-center gap-2 rounded-xl border border-green-500 px-5 py-2.5 font-semibold text-green-600 transition hover:bg-green-500 hover:text-white dark:text-green-400"
        >
          Update my available times
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-xl border border-card-border px-5 py-2.5 font-semibold transition hover:border-green-500"
        >
          <MessageSquare size={16} /> Message the academy
        </Link>
      </div>
    </div>
  );
}
