"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";

import { SignUpCta } from "@/components/SignUpCta";
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
  const { role } = useAuth();

  return role === "student" ? (
    <StudentPlanChoice daysPerWeek={daysPerWeek} className={className} />
  ) : (
    <SignUpCta label={label} className={className} arrowSize={arrowSize} />
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

  const mutation = useMutation({
    mutationFn: choosePlanForStudent,
    onSuccess: (saved) => {
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

  return (
    <button
      type="button"
      disabled={isChosen || isSaving}
      onClick={() => mutation.mutate(daysPerWeek)}
      className={`${className} disabled:cursor-default disabled:opacity-80`}
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
  );
}
