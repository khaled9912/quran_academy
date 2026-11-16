"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";

import { CardCheckout } from "@/components/CardCheckout";
import { ApiError } from "@/lib/backend-client";
import { money } from "@/lib/plans";
import { registrationCountryFromDocument } from "@/lib/registration";
import { reportUnexpectedError } from "@/lib/sentry";
import { useToast } from "@/providers/toast-provider";
import { getPublicPricing } from "@/services/pricing.service";
import {
  getCheckoutStatus,
  getPlanInvoice,
  issuePlanInvoice,
  openCheckout,
} from "@/services/payment.service";
import type { CheckoutTicket } from "@/types/payment";

const monthLabel = (month: string) =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

/** How often the screen asks the server whether the card payment landed. */
const STATUS_POLL_MS = 5_000;

/** Swap the checkout out this long before Stripe stops accepting it. */
const REFRESH_MARGIN_MS = 60_000;

/**
 * The bill for the last month that has ended, and the card payment against it.
 *
 * Every number on this card is the server's: the currency comes from the price
 * list, the amount from the invoice, and the fact that it is paid from the
 * status endpoint, which re-reads the provider. A redirect back from Stripe is
 * not treated as payment — it only makes this screen ask again sooner. A month
 * the card has settled is not offered to the transfer rail below it either.
 */
export function PlanPayCard() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [ticket, setTicket] = useState<CheckoutTicket | null>(null);
  const announced = useRef<Set<string>>(new Set());
  const refreshing = useRef(false);

  // A stable identity: CardCheckout re-runs its mount effect whenever a prop
  // changes, and an inline arrow would restart the payment form on every render.
  const country = registrationCountryFromDocument();

  // The public price list answers two things this screen cannot decide for
  // itself: which currency to bill, and whether this host can take a card.
  const pricingQuery = useQuery({
    queryKey: ["pricing", country ?? "default"],
    queryFn: () => getPublicPricing(country),
  });
  const currency = pricingQuery.data?.currency;
  const cardCheckout = pricingQuery.data?.cardCheckout === true;

  const invoiceQuery = useQuery({
    queryKey: ["payments", "invoice", currency ?? "default"],
    queryFn: () => getPlanInvoice(undefined, currency),
    enabled: !!currency,
  });

  const view = invoiceQuery.data;
  const invoice = view?.invoice ?? null;
  const paid = invoice?.status === "paid";

  // An open checkout from an earlier visit — a tab closed mid-payment, or the
  // redirect back from the provider — is picked up from the invoice itself.
  const openAttemptId =
    invoice?.status === "awaiting_payment"
      ? invoice.attempts.find((attempt) => attempt.status === "pending")?.id
      : undefined;
  const trackedAttemptId = ticket?.transactionId ?? openAttemptId;

  const statusQuery = useQuery({
    queryKey: ["payments", "attempt", trackedAttemptId],
    queryFn: () => getCheckoutStatus(trackedAttemptId as string),
    enabled: !!trackedAttemptId && !paid,
    refetchInterval: STATUS_POLL_MS,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    if (!statusQuery.data?.paid || !trackedAttemptId) return;
    if (announced.current.has(trackedAttemptId)) return;
    announced.current.add(trackedAttemptId);

    setTicket(null);
    showToast("Payment received. Your plan is paid and ready.", "success");
    void queryClient.invalidateQueries({ queryKey: ["payments"] });
    void queryClient.invalidateQueries({ queryKey: ["billing"] });
  }, [queryClient, showToast, statusQuery.data?.paid, trackedAttemptId]);

  const payMutation = useMutation({
    mutationFn: async (): Promise<CheckoutTicket> => {
      const invoiceId =
        invoice?.id ??
        (await issuePlanInvoice(currency ?? undefined)).invoice?.id;
      if (!invoiceId) {
        throw new Error("That month could not be billed. Please try again.");
      }
      return openCheckout(invoiceId);
    },
    onSuccess: async (opened) => {
      setTicket(opened);
      await queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) {
        reportUnexpectedError(error);
        showToast(
          "The card payment could not be opened. Please try again.",
          "error"
        );
      }
    },
  });

  // Stripe refuses a confirmation past the session's expiry, and the embedded
  // form reports that as a vague "you may have paid" error inside its own
  // iframe. Re-open the checkout before that moment — the server retires the
  // expired attempt and hands back a fresh session — and again when a slept
  // tab wakes up past it, so the form a student returns to is always payable.
  useEffect(() => {
    if (!ticket?.expiresAt) return;
    const expiresAt = Date.parse(ticket.expiresAt);
    if (Number.isNaN(expiresAt)) return;
    const invoiceId = ticket.invoiceId;
    let timer: number | undefined;
    let disposed = false;

    const refresh = async () => {
      if (refreshing.current || disposed) return;
      refreshing.current = true;
      try {
        const next = await openCheckout(invoiceId);
        if (!disposed) setTicket(next);
      } catch (error) {
        if (disposed) return;
        if (error instanceof ApiError) {
          // Paid, claimed by a transfer, or refused: the invoice query re-reads
          // the truth, and the pay button or the paid badge returns on its own.
          setTicket(null);
          void queryClient.invalidateQueries({ queryKey: ["payments"] });
        } else {
          // A network hiccup must not tear down a form that may still be live.
          reportUnexpectedError(error);
          timer = window.setTimeout(() => void refresh(), 30_000);
        }
      } finally {
        refreshing.current = false;
      }
    };

    const left = expiresAt - Date.now();
    // Comfortably before expiry while there is time; just after it otherwise,
    // when the server must retire the old session before issuing a new one.
    const delay =
      left > REFRESH_MARGIN_MS + 5_000
        ? left - REFRESH_MARGIN_MS
        : Math.max(left + 5_000, 5_000);
    timer = window.setTimeout(() => void refresh(), delay);

    const onVisibility = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() > expiresAt - REFRESH_MARGIN_MS
      ) {
        window.clearTimeout(timer);
        void refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ticket, queryClient]);

  // No card path on this host: the transfer panel below is how the month is
  // paid, and a button that cannot take money belongs on no screen.
  if (!cardCheckout) return null;

  if (pricingQuery.isPending || invoiceQuery.isPending) {
    return (
      <p className="flex items-center gap-2 text-sm text-foreground opacity-70">
        <Loader2 size={16} className="animate-spin" />
        Loading your bill…
      </p>
    );
  }

  if (pricingQuery.isError || invoiceQuery.isError) {
    return (
      <p className="text-sm text-foreground opacity-70">
        Your bill could not be loaded.{" "}
        <button
          type="button"
          onClick={() => {
            void pricingQuery.refetch();
            void invoiceQuery.refetch();
          }}
          className="underline"
        >
          Try again
        </button>
      </p>
    );
  }

  if (!view) return null;

  const billCurrency = invoice?.currency ?? view.currency ?? currency ?? "USD";

  if (view.daysPerWeek === 0 || !view.amount) {
    const noPlanOnRecord = view.daysPerWeek === 0;
    return (
      <section className="rounded-3xl border border-card-border bg-card-bg p-6">
        <h2 className="mb-1 text-xl font-semibold">Monthly payment</h2>
        <p className="text-sm text-foreground opacity-70">
          {noPlanOnRecord ? (
            <>
              Your plan is not on record yet, so there is nothing to pay.{" "}
              <Link
                href="/plans"
                className="font-semibold underline underline-offset-2"
              >
                Choose how many days a week
              </Link>{" "}
              and we will confirm your weekly time with you.
            </>
          ) : (
            <>
              Nothing is due for {monthLabel(view.month)}: a plan month is
              billed once it has ended and its classes have taken place.{" "}
              <Link
                href="/contact"
                className="font-semibold underline underline-offset-2"
              >
                Ask the academy
              </Link>{" "}
              if that does not look right.
            </>
          )}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-card-border bg-card-bg p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="mb-1 flex items-center gap-2 text-xl font-semibold">
            <CreditCard size={20} />
            Pay {monthLabel(view.month)} by card
          </h2>
          <p className="text-sm text-foreground opacity-70">
            {view.daysPerWeek} days a week ·{" "}
            {invoice
              ? `the ${monthLabel(view.month)} bill`
              : "your plan price for that month"}
          </p>
          <p className="mt-3 text-3xl font-bold">
            {money(invoice?.amount ?? view.amount, billCurrency)}
            <span className="ml-2 text-sm font-semibold text-foreground opacity-60">
              for the month
            </span>
          </p>
        </div>

        {paid ? (
          <p className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-500/15 dark:text-green-300">
            <CheckCircle2 size={16} />
            Paid{" "}
            {invoice?.paidAt
              ? `on ${new Date(invoice.paidAt).toLocaleDateString()}`
              : ""}
          </p>
        ) : (
          !ticket && (
            <button
              type="button"
              onClick={() => payMutation.mutate()}
              disabled={payMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
            >
              {payMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Opening…
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  {openAttemptId
                    ? "Continue paying by card"
                    : "Pay now by card"}
                </>
              )}
            </button>
          )
        )}
      </div>

      {paid ? (
        <p className="mt-4 text-sm text-foreground opacity-70">
          Nothing more is owed for {monthLabel(view.month)}. Your teacher keeps
          your usual time.
        </p>
      ) : (
        <>
          {statusQuery.data && !statusQuery.data.paid && !ticket ? (
            <p className="mt-4 text-sm text-foreground opacity-70">
              {statusQuery.data.providerStatus === "open"
                ? "Waiting for the payment to complete."
                : "Checking this payment with the payment company."}
            </p>
          ) : null}

          {ticket ? (
            <div className="mt-5">
              <CardCheckout
                publishableKey={ticket.publishableKey}
                clientSecret={ticket.clientSecret}
              />
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
