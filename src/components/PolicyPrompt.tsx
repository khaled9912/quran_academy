"use client";

import Link from "next/link";
import { Signature } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPolicyState } from "@/services/policy.service";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";
import { useAuth } from "@/providers/auth-provider";

/**
 * The standing reminder that an account has not signed its agreement yet. The
 * API also refuses the actions behind that agreement, so this is the friendly
 * route to the same place rather than the enforcement itself.
 */
export function PolicyPrompt({ attention = false }: { attention?: boolean }) {
  const { role, isAuthenticated } = useAuth();
  const query = useQuery({
    queryKey: ["policy-state"],
    queryFn: getPolicyState,
    enabled: isAuthenticated && (role === "teacher" || role === "student"),
    refetchInterval: LIVE_SYNC_INTERVAL,
    staleTime: 60_000,
  });

  const state = query.data;
  if (!state?.required || state.accepted) return null;

  return (
    <div
      id="policy-prompt"
      className={`mb-8 scroll-mt-24 rounded-3xl border p-5 ${
        attention
          ? "border-red-500 bg-red-500/10 ring-2 ring-red-500/30"
          : "border-amber-300 bg-amber-500/10"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Signature
            className={`mt-0.5 ${
              attention
                ? "text-red-600 dark:text-red-400"
                : "text-amber-700 dark:text-amber-300"
            }`}
          />
          <div>
            <p className="font-semibold text-foreground">
              {state.document?.title ?? "Academy agreement"}
            </p>
            <p className="mt-1 text-sm text-foreground/70">
              Read it clause by clause and tick each one. Until then, the
              academy cannot publish your times, finish your setup, or open a
              lesson room for you.
            </p>
            {attention && (
              <p className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400">
                This agreement is required. Review and accept it before you
                continue.
              </p>
            )}
          </div>
        </div>
        <Link
          href="/policy"
          className="rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold transition hover:border-green-500"
        >
          Review and accept
        </Link>
      </div>
    </div>
  );
}
