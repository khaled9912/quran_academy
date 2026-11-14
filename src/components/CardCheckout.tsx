"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

import { reportUnexpectedError } from "@/lib/sentry";

const SCRIPT_ID = "stripe-js";

/**
 * Stripe's own build for the embedded checkout page. Stripe.js must come from
 * js.stripe.com — that is what keeps the card details between the browser and
 * Stripe, and this site never sees them.
 */
const STRIPE_SCRIPT_URL = "https://js.stripe.com/endive/stripe.js";

type EmbeddedCheckoutPage = {
  mount: (selector: string) => void;
  unmount?: () => void;
};

type StripeJs = {
  createEmbeddedCheckoutPage: (options: {
    fetchClientSecret: () => Promise<string>;
  }) => Promise<EmbeddedCheckoutPage>;
};

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeJs;
  }
}

function loadStripeScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Stripe) {
      resolve();
      return;
    }
    const existing = document.getElementById(
      SCRIPT_ID
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Unable to load the card form.")),
        { once: true }
      );
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = STRIPE_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load the card form."));
    document.head.appendChild(script);
  });
}

let mountSequence = 0;

type Props = {
  /** The academy's publishable key, from the server. Safe to show in a page. */
  publishableKey: string;
  /** Opens the payment with no server round-trip of its own. */
  clientSecret: string;
  /** Keeps the parent from polling for a payment that never started. */
  onFailed?: () => void;
};

/**
 * Stripe's embedded checkout page, mounted where the Pay Now button was.
 *
 * Nothing here decides whether the month is paid. This component only renders
 * Stripe's form; the academy's own status endpoint is what the parent screen
 * believes, so a browser that lies about completing the form changes nothing.
 */
export function CardCheckout({
  publishableKey,
  clientSecret,
  onFailed,
}: Props) {
  const [mountId] = useState(() => `stripe-checkout-${++mountSequence}`);
  const [state, setState] = useState<"opening" | "ready" | "failed">("opening");

  useEffect(() => {
    if (!publishableKey || !clientSecret) {
      setState("failed");
      onFailed?.();
      return;
    }

    let cancelled = false;
    let checkout: EmbeddedCheckoutPage | null = null;

    loadStripeScript()
      .then(() => window.Stripe?.(publishableKey))
      .then((stripe) => {
        if (!stripe) throw new Error("Stripe.js did not load.");
        return stripe.createEmbeddedCheckoutPage({
          fetchClientSecret: async () => clientSecret,
        });
      })
      .then((instance) => {
        if (cancelled) {
          instance.unmount?.();
          return;
        }
        checkout = instance;
        instance.mount(`#${mountId}`);
        setState("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        reportUnexpectedError(error);
        setState("failed");
        onFailed?.();
      });

    return () => {
      cancelled = true;
      checkout?.unmount?.();
    };
  }, [clientSecret, mountId, onFailed, publishableKey]);

  if (state === "failed") {
    return (
      <p className="rounded-xl border border-card-border bg-background px-4 py-3 text-sm text-foreground opacity-80">
        The card form could not open. Check your connection and try again, or
        pay by bank transfer below.
      </p>
    );
  }

  return (
    <div>
      {state === "opening" ? (
        <p className="flex items-center gap-2 text-sm text-foreground opacity-70">
          <Loader2 size={16} className="animate-spin" />
          Opening the secure card form…
        </p>
      ) : (
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground opacity-60">
          <ShieldCheck size={14} />
          Card details go straight to Stripe, never to this site
        </p>
      )}
      <div id={mountId} className="min-h-64" />
    </div>
  );
}
