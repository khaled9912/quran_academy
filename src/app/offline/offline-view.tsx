"use client";

import { useEffect } from "react";
import Link from "next/link";
import { WifiOff } from "lucide-react";

export function OfflineView() {
  useEffect(() => {
    const retry = () => window.location.replace("/");
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, []);

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-background px-5 py-16 text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-card-border bg-card-bg p-8 text-center shadow-xl">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
          <WifiOff size={26} />
        </span>
        <h1 className="mt-5 text-2xl font-bold">You&apos;re offline</h1>
        <p className="mt-3 text-sm leading-6 text-foreground/70">
          This page needs a connection it doesn&apos;t have yet. Pages you
          visited before are still available, and anything you saved offline
          will sync automatically once you&apos;re back online.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-500"
          >
            Try again
          </button>
          <Link
            href="/"
            className="w-full rounded-xl border border-card-border px-4 py-3 text-sm font-semibold transition hover:border-green-500"
          >
            Go to the home page
          </Link>
        </div>
      </div>
    </main>
  );
}