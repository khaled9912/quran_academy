"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarPlus,
  CheckCircle2,
  Loader2,
  Send,
  Video,
} from "lucide-react";
import { ApiError } from "@/lib/backend-client";
import { useToast } from "@/providers/toast-provider";
import {
  finishTeacherOnboarding,
  proposeMeetingSlots,
} from "@/services/teacher-application.service";
import type { TeacherApplication } from "@/types/teacher-application";

const formatSlot = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

export function TeacherOnboardingPanel({
  application,
}: {
  application: TeacherApplication;
}) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [proposing, setProposing] = useState(false);
  const [slotInputs, setSlotInputs] = useState<string[]>([""]);
  const [confirmingFinish, setConfirmingFinish] = useState(false);
  const [pickerUrl, setPickerUrl] = useState<string | null>(null);

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["teacher-applications"] });

  const proposeMutation = useMutation({
    mutationFn: (slots: string[]) =>
      proposeMeetingSlots(application.id, slots),
    onSuccess: async (result) => {
      setProposing(false);
      setSlotInputs([""]);
      setPickerUrl(result.pickerUrl);
      showToast(
        result.emailed
          ? "Times sent. The teacher picks one from the emailed link."
          : "Email is not configured. Share the picker link below with the teacher.",
        "success"
      );
      await refresh();
    },
    onError: (error) => {
      if (!(error instanceof ApiError))
        showToast("Unable to send the meeting times.", "error");
    },
  });

  const finishMutation = useMutation({
    mutationFn: () => finishTeacherOnboarding(application.id),
    onSuccess: async (result) => {
      setConfirmingFinish(false);
      if (result.inviteCode) {
        showToast(
          `Onboarding finished — account created. Invite code: ${result.inviteCode} (valid for 15 minutes). Share it with the teacher so they can set a password.`,
          "success"
        );
      } else if (result.inviteEmailed) {
        showToast(
          "Onboarding finished — account created. The invitation email was sent to the teacher.",
          "success"
        );
      } else {
        showToast(
          "Onboarding finished — account created. Ask the teacher to use Forgot password to get a code.",
          "success"
        );
      }
      await refresh();
    },
    onError: (error) => {
      if (!(error instanceof ApiError))
        showToast("Unable to finish onboarding.", "error");
    },
  });

  if (application.onboardedAt)
    return (
      <p className="mt-4 inline-flex items-center gap-2 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-700 dark:text-green-400">
        <CheckCircle2 size={16} /> Onboarding complete{" "}
        {formatSlot(application.onboardedAt)} — open for assignment
      </p>
    );

  const submitSlots = () => {
    const filled = slotInputs.filter((value) => value.trim().length > 0);
    if (filled.length === 0) {
      showToast("Pick at least one time to offer.", "error");
      return;
    }
    const slots = filled.map((value) => new Date(value));
    if (slots.some((slot) => Number.isNaN(slot.getTime()))) {
      showToast("Enter a valid date and time.", "error");
      return;
    }
    if (slots.some((slot) => slot.getTime() <= Date.now() + 5 * 60_000)) {
      showToast("Offer times a little further in the future.", "error");
      return;
    }
    proposeMutation.mutate(slots.map((slot) => slot.toISOString()));
  };

  return (
    <div className="mt-4 rounded-2xl border border-card-border p-4">
      <p className="text-sm font-bold uppercase tracking-[.14em] text-amber-700 dark:text-amber-300">
        Onboarding
      </p>

      {application.meetingStartsAt ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm">
            Intro meeting booked for{" "}
            <strong>{formatSlot(application.meetingStartsAt)}</strong> (30
            minutes, academy room).
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/onboarding/meeting?applicationId=${application.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <Video size={16} /> Join meeting room
            </Link>
            {!confirmingFinish ? (
              <button
                type="button"
                onClick={() => setConfirmingFinish(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm font-semibold transition hover:border-green-500"
              >
                <CheckCircle2 size={16} /> Finish onboarding
              </button>
            ) : (
              <span className="inline-flex flex-wrap items-center gap-2 text-sm">
                <span className="opacity-75">
                  This creates the teacher account and opens them for student
                  assignment.
                </span>
                <button
                  type="button"
                  onClick={() => finishMutation.mutate()}
                  disabled={finishMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {finishMutation.isPending && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  Confirm finish
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingFinish(false)}
                  className="rounded-xl border border-card-border px-4 py-2 text-sm font-semibold"
                >
                  Cancel
                </button>
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {(application.meetingSlots ?? []).length > 0 && (
            <div className="text-sm">
              <p className="opacity-75">
                Waiting for the teacher to pick one of these times:
              </p>
              <ul className="mt-1 list-inside list-disc">
                {(application.meetingSlots ?? []).map((slot) => (
                  <li key={slot}>{formatSlot(slot)}</li>
                ))}
              </ul>
            </div>
          )}
          {!proposing ? (
            <button
              type="button"
              onClick={() => setProposing(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm font-semibold transition hover:border-green-500"
            >
              <CalendarPlus size={16} />
              {(application.meetingSlots ?? []).length > 0
                ? "Offer new times"
                : "Propose meeting times"}
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs opacity-70">
                Offer up to three times (your local time). The teacher sees them
                in their own timezone and picks one from an emailed link.
              </p>
              {slotInputs.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="datetime-local"
                    value={value}
                    onChange={(event) =>
                      setSlotInputs((current) =>
                        current.map((entry, i) =>
                          i === index ? event.target.value : entry
                        )
                      )
                    }
                    className="rounded-xl border border-card-border bg-background px-3 py-2 text-sm text-foreground focus:border-green-500 focus:outline-none"
                  />
                  {slotInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setSlotInputs((current) =>
                          current.filter((_, i) => i !== index)
                        )
                      }
                      className="text-xs font-semibold opacity-60 hover:opacity-100"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-2">
                {slotInputs.length < 3 && (
                  <button
                    type="button"
                    onClick={() =>
                      setSlotInputs((current) => [...current, ""])
                    }
                    className="rounded-xl border border-card-border px-3 py-2 text-xs font-semibold"
                  >
                    Add another time
                  </button>
                )}
                <button
                  type="button"
                  onClick={submitSlots}
                  disabled={proposeMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {proposeMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  Send to teacher
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProposing(false);
                    setSlotInputs([""]);
                  }}
                  className="rounded-xl border border-card-border px-4 py-2 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {pickerUrl && (
            <p className="break-all rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              Picker link (copy to the teacher): {pickerUrl}
            </p>
          )}
        </div>
      )}
    </div>
  );
}