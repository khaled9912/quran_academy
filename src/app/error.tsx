"use client";

import { reportUnexpectedError } from "@/lib/sentry";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportUnexpectedError(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-4 px-5 py-24 text-center text-foreground">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="opacity-70">
        This page could not be loaded. The error has been reported — please try
        again.
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
      >
        Try again
      </button>
    </main>
  );
}
