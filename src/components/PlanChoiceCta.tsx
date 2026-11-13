"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";

import { SignUpCta } from "@/components/SignUpCta";
import { clearPlanChoice, rememberPlanChoice } from "@/lib/plan-choice";
import {
  choosePlanForStudent,
  getMyOnboarding,
} from "@/services/onboarding.service";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { reportUnexpectedError } from "@/lib/sentry";

type Props = {
  /** The tier on this card. */
  daysPerWeek: number;
  /** What a visitor without a student account is invited to do. */
  label: string;
  className: string;
  arrowSize?: number;
};

/**
 * The plans page for the one visitor who can actually pick a tier: a signed-in
 * student. Recording it tells the academy how often the family expects to learn,
 * which is what the assignment desk sizes a placement against. It is not a
 * purchase — nothing is billed until lessons take place — so an anonymous
 * visitor keeps the sign-up invitation and a teacher or admin goes to their own
 * dashboard.
 */
export function PlanChoiceCta({
  daysPerWeek,
  label,
  className,
  arrowSize,
}: Props) {
  const { role, isAuthenticated } = useAuth();

  return role === "student" ? (
    <StudentPlanChoice daysPerWeek={daysPerWeek} className={className} />
  ) : (
    <SignUpCta
      label={label}
      className={className}
      arrowSize={arrowSize}
      onClick={
        // A visitor who does not have an account yet cannot have a plan on
        // record, so the tier travels with them to setup instead.
        isAuthenticated ? undefined : () => rememberPlanChoice(daysPerWeek)
      }
    />
  );
}

function StudentPlanChoice({
  daysPerWeek,
  className,
}: {
  daysPerWeek: number;
  className: string;
}) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const onboardingQuery = useQuery({
    queryKey: ["onboarding", "student"],
    queryFn: getMyOnboarding,
  });
  const chosen = onboardingQuery.data?.planDaysPerWeek ?? 0;
  const offeredDays = new Set(
    (onboardingQuery.data?.weeklySlots ?? []).map((slot) => slot.dayOfWeek)
  ).size;
  // A week that only holds two days cannot carry a four-day plan. Before setup
  // there are no times to measure, so the choice is free and setup enforces it.
  const shortBy = offeredDays > 0 ? daysPerWeek - offeredDays : 0;

  const mutation = useMutation({
    mutationFn: choosePlanForStudent,
    onSuccess: (saved) => {
      clearPlanChoice();
      queryClient.setQueryData(["onboarding", "student"], saved);
      showToast(
        `Noted: ${saved.planDaysPerWeek} days a week. We will confirm your weekly time with you.`,
        "success"
      );
    },
    onError: (error) => {
      reportUnexpectedError(error);
      showToast("That plan could not be saved. Please try again.", "error");
    },
  });

  const isChosen = chosen === daysPerWeek;
  const isSaving = mutation.isPending && mutation.variables === daysPerWeek;
  const isShort = shortBy > 0 && !isChosen;

  return (
    <>
      <button
        type="button"
        disabled={isChosen || isSaving || isShort}
        onClick={() => mutation.mutate(daysPerWeek)}
        className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {isChosen ? (
          <>
            <Check size={16} />
            Your plan
          </>
        ) : isSaving ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Saving…
          </>
        ) : (
          "Choose this plan"
        )}
      </button>
      {isShort && (
        <p className="mt-2 text-xs leading-5 text-[#7a5a1d] dark:text-amber-300">
          Your saved times cover {offeredDays}{" "}
          {offeredDays === 1 ? "day" : "days"}, and this plan needs{" "}
          {daysPerWeek}.{" "}
          <Link
            href="/student/onboarding"
            className="font-semibold underline underline-offset-2"
          >
            Offer more days
          </Link>{" "}
          first.
        </p>
      )}
    </>
  );
}
