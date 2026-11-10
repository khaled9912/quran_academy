import { sentryOptions } from "./lib/sentry";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
// Development builds never send events, even if a DSN is set locally.
const enabled = process.env.NODE_ENV === "production" && Boolean(dsn);

type SentryClient = typeof import("@sentry/nextjs");

let clientPromise: Promise<SentryClient> | null = null;

const loadClient = (): Promise<SentryClient> =>
  (clientPromise ??= import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn,
      enabled,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      integrations: [Sentry.browserTracingIntegration()],
      ...sentryOptions,
    });
    return Sentry;
  }));

export const onRouterTransitionStart = (
  ...args: Parameters<SentryClient["captureRouterTransitionStart"]>
) => {
  if (!enabled) return;
  void loadClient().then((Sentry) =>
    Sentry.captureRouterTransitionStart(...args)
  );
};

if (enabled && typeof window !== "undefined") {
  // Until init finishes, this module is the only error listener, so failures
  // in that window are forwarded by hand; afterwards the SDK takes over and
  // these are removed to avoid double reporting.
  const forward = (error: unknown) =>
    void loadClient().then((Sentry) => Sentry.captureException(error));

  const onError = (event: ErrorEvent) => {
    if (event.error) forward(event.error);
  };
  const onRejection = (event: PromiseRejectionEvent) => {
    forward(event.reason);
  };
  window.addEventListener("error", onError, true);
  window.addEventListener("unhandledrejection", onRejection);

  void loadClient().then(() => {
    window.removeEventListener("error", onError, true);
    window.removeEventListener("unhandledrejection", onRejection);
  });

  const start = () => void loadClient();
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
}
