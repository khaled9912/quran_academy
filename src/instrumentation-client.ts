import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "./lib/sentry";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  // Development builds never send events, even if a DSN is set locally.
  enabled: process.env.NODE_ENV === "production" && Boolean(dsn),
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  integrations: [Sentry.browserTracingIntegration()],
  ...sentryOptions,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
