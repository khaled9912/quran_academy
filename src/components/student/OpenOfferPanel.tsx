"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarClock, RefreshCw, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyOpenOffers,
  publishOpenOffer,
  withdrawOpenOffer,
} from "@/services/scheduling.service";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";
import type { OpenStudentOffer } from "@/types/scheduling";

const OPEN_OFFER_LIMIT = 4;
const DURATIONS = [30, 45, 60] as const;
type DurationMinutes = (typeof DURATIONS)[number];

const durationLabel = (minutes: number) =>
  minutes === 60 ? "1 hour" : `${minutes} min`;

const offerDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const formatOfferRange = (startsAt: string, endsAt: string) => {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "—";
  return `${offerDateFormatter.format(start)} – ${offerDateFormatter.format(
    end
  )}`;
};

const localInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const statusCopy = (offer: OpenStudentOffer) => {
  if (offer.status === "claimed")
    return `Booked with ${offer.claimedByTeacherName ?? "a teacher"}`;
  if (offer.status === "withdrawn") return "Withdrawn";
  return "Open · all teachers were notified";
};

export function OpenOfferPanel() {
  const { role } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return localInputDate(tomorrow);
  });
  const [start, setStart] = useState("17:00");
  const [duration, setDuration] = useState<DurationMinutes>(60);

  const offersQuery = useQuery({
    queryKey: ["open-offers", "student"],
    queryFn: getMyOpenOffers,
    enabled: role === "student",
    refetchInterval: LIVE_SYNC_INTERVAL,
  });

  const offers = useMemo(
    () =>
      [...(offersQuery.data ?? [])].sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      ),
    [offersQuery.data]
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["open-offers"] });

  const publishMutation = useMutation({
    mutationFn: ({ startsAt, endsAt }: { startsAt: string; endsAt: string }) =>
      publishOpenOffer(startsAt, endsAt),
    onSuccess: async () => {
      await invalidate();
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (offerId: string) => withdrawOpenOffer(offerId),
    onSuccess: async () => {
      await invalidate();
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!date) {
      showToast("Choose a date.", "error");
      return;
    }
    const startsAt = new Date(`${date}T${start}`);
    if (Number.isNaN(startsAt.getTime())) {
      showToast("Choose a valid start time.", "error");
      return;
    }
    if (startsAt.getTime() <= Date.now()) {
      showToast("Choose a time in the future.", "error");
      return;
    }
    const openCount = offers.filter(
      (offer) =>
        offer.status === "open" &&
        new Date(offer.startsAt).getTime() > Date.now()
    ).length;
    if (openCount >= OPEN_OFFER_LIMIT) {
      showToast(
        `You already have ${OPEN_OFFER_LIMIT} open offers. Withdraw one to add another.`,
        "error"
      );
      return;
    }
    const endsAt = new Date(startsAt.getTime() + duration * 60_000);
    publishMutation.mutate({
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    });
  };

  useEffect(() => {
    if (offersQuery.error) {
      showToast(
        offersQuery.error instanceof Error
          ? offersQuery.error.message
          : "Unable to update your offered times.",
        "error"
      );
    }
  }, [offersQuery.error, showToast]);

  return (
    <section className="mt-8 rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <CalendarClock className="text-green-600 dark:text-green-400" />
          <div>
            <h2 className="text-2xl font-semibold">Offer a lesson time</h2>
            <p className="mt-1 max-w-2xl text-sm text-foreground opacity-70">
              You have no teacher yet. Offer up to {OPEN_OFFER_LIMIT} times and
              every active teacher is notified — the first teacher to accept
              books it on your schedule. Each lesson is 30, 45, or 60 minutes.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void offersQuery.refetch()}
          className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-3 py-2 text-sm font-semibold transition hover:border-green-500"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <form
        onSubmit={submit}
        className="mt-5 grid gap-4 md:grid-cols-[1.1fr_1fr_1.3fr_auto] md:items-end"
      >
        <label className="block text-sm font-semibold">
          Date
          <input
            required
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-2 w-full rounded-xl border border-card-border bg-background px-3 py-3 font-normal text-foreground outline-none focus:border-green-500"
          />
        </label>
        <label className="block text-sm font-semibold">
          Starts at
          <input
            required
            type="time"
            value={start}
            onChange={(event) => setStart(event.target.value)}
            className="mt-2 w-full rounded-xl border border-card-border bg-background px-3 py-3 font-normal text-foreground outline-none focus:border-green-500"
          />
        </label>
        <fieldset>
          <legend className="text-sm font-semibold">Length</legend>
          <div className="mt-2 flex gap-2">
            {DURATIONS.map((minutes) => {
              const selected = duration === minutes;
              return (
                <button
                  key={minutes}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setDuration(minutes)}
                  className={`flex-1 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                    selected
                      ? "border-green-700 bg-green-500/15 text-green-900 dark:border-green-400 dark:text-green-300"
                      : "border-card-border bg-card-bg text-foreground/60 hover:border-green-500"
                  }`}
                >
                  {durationLabel(minutes)}
                </button>
              );
            })}
          </div>
        </fieldset>
        <button
          disabled={publishMutation.isPending}
          className="h-[50px] rounded-xl bg-[#1c5145] px-5 font-semibold text-white transition hover:bg-[#163f36] disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-500"
        >
          {publishMutation.isPending ? "Offering…" : "Offer time"}
        </button>
      </form>

      <div className="mt-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
          Your offered times
        </h3>
        {offersQuery.isLoading ? (
          <p className="mt-3 text-sm text-foreground opacity-60">
            Loading your offered times…
          </p>
        ) : offers.length ? (
          <ul className="mt-3 space-y-3">
            {offers.map((offer) => {
              const open = offer.status === "open";
              const withdrawing =
                withdrawMutation.isPending &&
                withdrawMutation.variables === offer.id;
              return (
                <li
                  key={offer.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-card-border bg-background p-4"
                >
                  <div>
                    <p className="font-semibold">
                      {formatOfferRange(offer.startsAt, offer.endsAt)}
                    </p>
                    <p className="mt-1 text-sm text-foreground opacity-60">
                      {statusCopy(offer)}
                    </p>
                  </div>
                  {open ? (
                    <button
                      type="button"
                      onClick={() => withdrawMutation.mutate(offer.id)}
                      disabled={withdrawing}
                      aria-label="Withdraw offered time"
                      className="rounded-lg p-2 text-red-600 transition hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : offer.status === "claimed" ? (
                    <Link
                      href="/schedule"
                      className="text-sm font-semibold text-green-700 hover:underline dark:text-green-400"
                    >
                      View schedule →
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 rounded-xl border border-dashed border-card-border p-6 text-center text-sm text-foreground opacity-60">
            You have not offered a time yet. Add one above and teachers will be
            notified right away.
          </p>
        )}
      </div>
    </section>
  );
}
