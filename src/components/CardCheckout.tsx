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
  destroy?: () => void;
};

// unmount() throws on a page that never mounted; destroy() is safe in any state.
function disposeCheckout(page: EmbeddedCheckoutPage) {
  if (typeof page.destroy === "function") {
    page.destroy();
  } else {
    page.unmount?.();
  }
}

type StripeJs = {
  initEmbeddedCheckout?: (options: {
    clientSecret: string;
  }) => Promise<EmbeddedCheckoutPage>;
  createEmbeddedCheckoutPage?: (options: {
    fetchClientSecret: () => Promise<string>;
  }) => Promise<EmbeddedCheckoutPage>;
};

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeJs;
  }
}

// One shared load per page: removing a <script> tag does not cancel its
// download, so re-adding one while the first is in flight makes Stripe.js
// execute twice ("loaded more than one time").
let stripeScriptPromise: Promise<void> | null = null;

function resetStripeScript() {
  stripeScriptPromise = null;
  document.getElementById(SCRIPT_ID)?.remove();
  delete window.Stripe;
}

function loadStripeScript(): Promise<void> {
  if (window.Stripe) return Promise.resolve();
  if (stripeScriptPromise) return stripeScriptPromise;

  stripeScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = STRIPE_SCRIPT_URL;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.referrerPolicy = "no-referrer";
    script.onload = () => {
      if (window.Stripe) {
        resolve();
        return;
      }
      reject(new Error("Stripe.js did not register in this browser."));
    };
    script.onerror = () => reject(new Error("Unable to load the card form."));
    document.head.appendChild(script);
  }).catch((error) => {
    resetStripeScript();
    throw error;
  });

  return stripeScriptPromise;
}

let mountSequence = 0;

type Props = {
  /** The academy's publishable key, from the server. Safe to show in a page. */
  publishableKey: string;
  /** Opens the payment with no server round-trip of its own. */
  clientSecret: string;
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
}: Props) {
  const [mountId] = useState(() => `stripe-checkout-${++mountSequence}`);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<"opening" | "ready" | "failed">("opening");

  useEffect(() => {
    if (!publishableKey || !clientSecret) {
      setState("failed");
      return;
    }

    let cancelled = false;
    let checkout: EmbeddedCheckoutPage | null = null;

    const open = async () => {
      await loadStripeScript();
      // StrictMode cancels the first pass while the script is still loading.
      // Initializing a page there would open the same session twice on one
      // Stripe controller, and the second init is the one that gets refused.
      if (cancelled) return;

      let stripe: StripeJs | undefined;
      try {
        stripe = window.Stripe?.(publishableKey);
      } catch (error) {
        resetStripeScript();
        throw error;
      }
      if (!stripe) {
        resetStripeScript();
        throw new Error("Stripe.js did not load.");
      }

      // The endive build keeps initEmbeddedCheckout as a stub that always
      // throws ("has been removed"), so the newer method must be tried first.
      let instance: EmbeddedCheckoutPage;
      if (typeof stripe.createEmbeddedCheckoutPage === "function") {
        instance = await stripe.createEmbeddedCheckoutPage({
          fetchClientSecret: async () => clientSecret,
        });
      } else if (typeof stripe.initEmbeddedCheckout === "function") {
        instance = await stripe.initEmbeddedCheckout({ clientSecret });
      } else {
        throw new Error("The embedded card checkout is not available in this browser.");
      }

      if (cancelled) {
        disposeCheckout(instance);
        return;
      }
      checkout = instance;
      instance.mount(`#${mountId}`);
      setState("ready");
    };

    open().catch((error) => {
      if (cancelled) return;
      reportUnexpectedError(error);
      setState("failed");
      // Keep the payment attempt alive and allow a retry instead of clearing the
      // checkout on a transient script or network hiccup. Clearing the ticket here
      // is what causes the visible flicker even when the backend checkout is valid.
    });

    return () => {
      cancelled = true;
      if (checkout) disposeCheckout(checkout);
    };
  }, [attempt, clientSecret, mountId, publishableKey]);

  if (state === "failed") {
    return (
      <div className="rounded-xl border border-card-border bg-background px-4 py-3 text-sm text-foreground opacity-80">
        <p>
          The card form could not open. Check your connection and try again, or
          pay by bank transfer below.
        </p>
        <button
          type="button"
          onClick={() => {
            setState("opening");
            setAttempt((current) => current + 1);
          }}
          className="mt-3 inline-flex items-center rounded-lg border border-card-border bg-card-bg px-3 py-1.5 font-medium text-foreground hover:bg-card-bg/80"
        >
          Try card payment again
        </button>
      </div>
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
