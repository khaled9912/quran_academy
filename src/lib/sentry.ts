import * as Sentry from "@sentry/nextjs";
import { ApiError } from "./backend-client";

/**
 * Noise that should never consume the Sentry error quota: Next.js navigation
 * control flow, browser/layout quirks, and opaque cross-origin script errors.
 */
const ignoredErrors: (string | RegExp)[] = [
  /^NEXT_REDIRECT/,
  /^NEXT_NOT_FOUND/,
  /NEXT_HTTP_ERROR_FALLBACK/,
  "ResizeObserver loop limit exceeded",
  "ResizeObserver loop completed with undelivered notifications.",
  "Non-Error promise rejection captured",
  "Script error.",
];

export const sentryOptions = {
  ignoreErrors: ignoredErrors,
  // Errors raised from browser extensions are not part of this app.
  denyUrls: [
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    /^safari(-web)?-extension:\/\//,
  ],
  beforeSend(event: Sentry.ErrorEvent, hint: Sentry.EventHint) {
    // Only real failures are worth a quota slot, never warnings/info/logs.
    if (event.level && event.level !== "error" && event.level !== "fatal") {
      return null;
    }
    // 4xx responses are expected flows (auth, validation) already shown in the UI.
    const original = hint?.originalException;
    if (original instanceof ApiError && original.status < 500) return null;
    return event;
  },
};

/** Reports unexpected failures; expected 4xx API responses are left to the UI. */
export function reportUnexpectedError(error: unknown) {
  if (error instanceof ApiError && error.status < 500) return;
  Sentry.captureException(error);
}
