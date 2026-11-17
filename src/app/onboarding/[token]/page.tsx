"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarCheck2, CheckCircle2, Loader2 } from "lucide-react";
import { ApiError } from "@/lib/backend-client";
import {
  getOnboardingInvite,
  pickOnboardingSlot,
} from "@/services/teacher-onboarding.service";

const formatSlot = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

export default function OnboardingPickerPage() {
  const { token } = useParams<{ token: string }>();
  const [selected, setSelected] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["onboarding-invite", token],
    queryFn: () => getOnboardingInvite(token),
    retry: false,
  });

  const pickMutation = useMutation({
    mutationFn: (slot: string) => pickOnboardingSlot(token, slot),
    onError: (error) => {
      if (error instanceof ApiError && (error.status === 404 || error.status === 409))
        void query.refetch();
    },
  });

  if (query.isLoading)
    return (
      <main className="mx-auto flex max-w-xl items-center gap-3 px-5 py-24 text-foreground">
        <Loader2 className="animate-spin" /> Loading your meeting times…
      </main>
    );

  if (query.isError || !query.data)
    return (
      <main className="mx-auto max-w-xl px-5 py-24 text-foreground">
        <div className="rounded-3xl border border-card-border bg-card-bg p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">This link is no longer valid</h1>
          <p className="mt-3 text-foreground/70">
            It may have expired or already been used. Ask the academy to send
            you a new link.
          </p>
        </div>
      </main>
    );

  const invite = query.data;
  const booked = pickMutation.data;

  if (booked)
    return (
      <main className="mx-auto max-w-xl px-5 py-24 text-foreground">
        <div className="rounded-3xl border border-green-500 bg-green-500/10 p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto text-green-600" size={32} />
          <h1 className="mt-4 text-2xl font-bold">Your meeting is booked</h1>
          <p className="mt-3 font-semibold">
            {formatSlot(booked.meetingStartsAt)} — 30 minutes
          </p>
          <p className="mt-3 text-sm text-foreground/70">
            We emailed you the join link. No account or sign-in is needed —
            open the link when the meeting starts.
          </p>
          <a
            href={booked.joinUrl}
            className="mt-6 inline-block rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            Meeting join link
          </a>
          <p className="mt-3 break-all text-xs text-foreground/60">
            Save it: {booked.joinUrl}
          </p>
        </div>
      </main>
    );

  return (
    <main className="min-h-[75vh] bg-background px-5 py-16 text-foreground">
      <div className="mx-auto max-w-xl">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-amber-700 dark:text-amber-300">
          Ana Quran Academy
        </p>
        <h1 className="mt-2 text-3xl font-bold">
          Hello {invite.fullName}, pick your intro meeting time
        </h1>
        <p className="mt-2 text-foreground/70">
          A 30-minute video meeting with the academy team before you start
          teaching. Times are shown in your local timezone.
        </p>

        <div className="mt-8 space-y-3">
          {invite.slots.map((slot) => {
            const on = selected === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => setSelected(slot)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-5 text-left transition ${
                  on
                    ? "border-green-500 bg-green-500/10"
                    : "border-card-border bg-card-bg hover:border-green-500"
                }`}
              >
                <CalendarCheck2
                  size={20}
                  className={on ? "text-green-600" : "opacity-60"}
                />
                <span className="font-semibold">{formatSlot(slot)}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!selected || pickMutation.isPending}
          onClick={() => selected && pickMutation.mutate(selected)}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pickMutation.isPending && <Loader2 className="animate-spin" size={16} />}
          Confirm this time
        </button>
        <p className="mt-3 text-xs text-foreground/60">
          This link can be used once and expires{" "}
          {new Date(invite.expiresAt).toLocaleDateString(undefined, {
            dateStyle: "medium",
          })}
          .
        </p>
      </div>
    </main>
  );
}