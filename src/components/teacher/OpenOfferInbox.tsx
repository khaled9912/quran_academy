"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BellRing, Check, RefreshCw } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptOpenOffer,
  getTeacherOpenOffers,
} from "@/services/scheduling.service";
import { useAuth } from "@/providers/auth-provider";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";
import type { OpenStudentOffer } from "@/types/scheduling";

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

export function OpenOfferInbox() {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState("");
  const [acceptError, setAcceptError] = useState("");

  const offersQuery = useQuery({
    queryKey: ["open-offers", "teacher"],
    queryFn: getTeacherOpenOffers,
    enabled: role === "teacher",
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

  const openOffers = offers.filter(
    (offer) =>
      offer.status === "open" && new Date(offer.startsAt).getTime() > Date.now()
  );
  const claimedOffers = offers.filter((offer) => offer.status === "claimed");

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["open-offers"] }),
      queryClient.invalidateQueries({ queryKey: ["lessons"] }),
      queryClient.invalidateQueries({ queryKey: ["availability"] }),
      queryClient.invalidateQueries({ queryKey: ["teacher-profile"] }),
    ]);
  };

  const acceptMutation = useMutation({
    mutationFn: (offerId: string) => acceptOpenOffer(offerId),
    onSuccess: async (result) => {
      setAcceptError("");
      const student = result.offer?.studentName ?? "the student";
      setNotice(`Booked ${student}. The lesson is now on your schedule.`);
      await invalidate();
    },
    onError: async (error) => {
      setAcceptError(
        error instanceof Error
          ? error.message
          : "This time is no longer available."
      );
      await invalidate();
    },
  });

  const accept = (offer: OpenStudentOffer) => {
    if (
      window.confirm(
        `Accept ${offer.studentName}'s offered time on ${formatOfferRange(
          offer.startsAt,
          offer.endsAt
        )}? It will be booked on your schedule right away.`
      )
    ) {
      setNotice("");
      setAcceptError("");
      acceptMutation.mutate(offer.id);
    }
  };

  const error = acceptError || offersQuery.error;

  return (
    <section className="mt-8 rounded-3xl border border-card-border bg-card-bg p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <BellRing className="text-green-700 dark:text-green-400" />
          <div>
            <h2 className="text-xl font-bold">
              Students looking for a teacher ({openOffers.length})
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-foreground/70">
              Unassigned students can offer a one-off time. The first teacher to
              accept books it instantly; everyone else sees that the student
              picked another teacher.
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

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
        >
          {error instanceof Error
            ? error.message
            : error || "Unable to load student offers."}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mt-5 rounded-xl bg-green-500/10 p-4 text-sm text-green-800 dark:text-green-300"
        >
          {notice}{" "}
          <Link href="/schedule" className="font-semibold underline">
            Open schedule
          </Link>
        </p>
      )}

      <div className="mt-5 space-y-3">
        {offersQuery.isLoading ? (
          <p className="text-sm text-foreground/60">Loading student offers…</p>
        ) : openOffers.length ? (
          openOffers.map((offer) => {
            const accepting =
              acceptMutation.isPending && acceptMutation.variables === offer.id;
            return (
              <div
                key={offer.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-card-border bg-background p-4"
              >
                <div>
                  <p className="font-semibold">{offer.studentName}</p>
                  <p className="mt-1 text-sm text-foreground/60">
                    {formatOfferRange(offer.startsAt, offer.endsAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => accept(offer)}
                  disabled={accepting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1c5145] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#163f36] disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-500"
                >
                  <Check size={16} />
                  {accepting ? "Booking…" : "Accept and book"}
                </button>
              </div>
            );
          })
        ) : (
          <p className="rounded-xl border border-dashed border-card-border p-6 text-center text-sm text-foreground/60">
            No open student offers right now. You will be notified when a
            student without a teacher posts a time.
          </p>
        )}
      </div>

      {claimedOffers.length ? (
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
            Recently booked by other teachers
          </h3>
          <ul className="mt-2 space-y-2">
            {claimedOffers.map((offer) => (
              <li
                key={offer.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-foreground/5 px-4 py-3 text-sm"
              >
                <span>
                  <strong>{offer.studentName}</strong> chose{" "}
                  <strong>
                    {offer.claimedByTeacherName ?? "another teacher"}
                  </strong>
                </span>
                <span className="text-foreground/60">
                  {formatOfferRange(offer.startsAt, offer.endsAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
