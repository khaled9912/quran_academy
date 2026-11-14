"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/backend-client";
import { acceptPolicy, getPolicyState } from "@/services/policy.service";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";

const formatStamp = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function PolicyPage() {
  const { role } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["policy-state"], queryFn: getPolicyState });
  const state = query.data;
  const doc = state?.document ?? null;

  const [ticked, setTicked] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  // A new build of the document replaces the text, so the ticks made against
  // the version on screen have to be thrown away with it.
  useEffect(() => {
    setTicked([]);
    setConfirmed(false);
  }, [doc?.key, doc?.version]);

  const missing = useMemo(
    () => (doc?.clauses ?? []).filter((clause) => !ticked.includes(clause.id)),
    [doc, ticked]
  );

  const mutation = useMutation({
    mutationFn: () => acceptPolicy(doc!.key, doc!.version, ticked),
    onSuccess: async () => {
      setConfirmed(false);
      showToast("Agreement accepted. You can continue now.", "success");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["policy-state"] }),
        queryClient.invalidateQueries({ queryKey: ["onboarding"] }),
        queryClient.invalidateQueries({ queryKey: ["availability-rules"] }),
      ]);
    },
    onError: (error) => {
      // backend-client has already raised the toast; a stale version only needs
      // the page to show the current text again.
      if (error instanceof ApiError && error.status === 409)
        void query.refetch();
    },
  });

  const toggle = (id: string) =>
    setTicked((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );

  if (query.isLoading)
    return (
      <main className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-24 text-foreground">
        <Loader2 className="animate-spin" /> Loading the agreement…
      </main>
    );

  if (!state?.required || !doc)
    return (
      <main className="mx-auto max-w-3xl px-5 py-24 text-foreground">
        <div className="rounded-3xl border border-card-border bg-card-bg p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto text-green-600" size={32} />
          <h1 className="mt-4 text-2xl font-bold">Nothing to sign</h1>
          <p className="mt-3 text-foreground/70">
            This account type has no agreement waiting on it.
          </p>
          <Link
            href={role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"}
            className="mt-6 inline-block rounded-xl border border-card-border bg-background px-4 py-2.5 text-sm font-semibold transition hover:border-green-500"
          >
            Back to your dashboard
          </Link>
        </div>
      </main>
    );

  const rtl = doc.language === "ar";
  const signed = state.accepted;

  return (
    <main className="min-h-[75vh] bg-background px-5 py-12 text-foreground md:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-amber-700 dark:text-amber-300">
          Academy agreement
        </p>
        <h1 className="mt-2 text-3xl font-bold" dir={rtl ? "rtl" : "ltr"}>
          {doc.title}
        </h1>
        <p className="mt-2 text-foreground/70" dir={rtl ? "rtl" : "ltr"}>
          {doc.summary}
        </p>
        <p className="mt-2 text-sm text-foreground/50">
          Version {doc.version}
          {state.acceptedAt && ` · accepted ${formatStamp(state.acceptedAt)}`}
        </p>

        {signed ? (
          <div className="mt-8 rounded-3xl border border-green-500 bg-green-500/10 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-600" />
              <p className="font-semibold">
                You accepted this version on {formatStamp(state.acceptedAt!)}.
              </p>
            </div>
            <p className="mt-2 text-sm text-foreground/70">
              The academy will ask again if the rules change.
            </p>
            <Link
              href={
                role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"
              }
              className="mt-5 inline-block rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold transition hover:border-green-500"
            >
              Continue
            </Link>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (missing.length === 0 && confirmed && !mutation.isPending)
                void mutation.mutate();
            }}
            className="mt-8 space-y-4"
          >
            {doc.clauses.map((clause, index) => {
              const on = ticked.includes(clause.id);
              return (
                <label
                  key={clause.id}
                  dir={rtl ? "rtl" : "ltr"}
                  className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition ${
                    on
                      ? "border-green-500 bg-green-500/10"
                      : "border-card-border bg-card-bg hover:border-green-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggle(clause.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-green-600"
                  />
                  <span>
                    <span className="font-semibold">
                      {index + 1}. {clause.title}
                    </span>
                    <span className="mt-2 block whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                      {clause.body}
                    </span>
                  </span>
                </label>
              );
            })}

            <div className="rounded-2xl border border-card-border bg-card-bg p-5">
              <label className="flex cursor-pointer items-start gap-4">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-green-600"
                />
                <span className="text-sm">
                  I have read every clause above and agree to them for this
                  account.
                  <span className="text-red-500 dark:text-red-400"> *</span>
                </span>
              </label>
              {!confirmed && ticked.length === doc.clauses.length && (
                <p className="mt-3 text-sm text-foreground/60">
                  Tick the line above to sign.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={missing.length > 0 || !confirmed || mutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mutation.isPending && <Loader2 className="animate-spin" size={16} />}
                Accept and continue
              </button>
              {missing.length > 0 && (
                <p className="text-sm text-foreground/60">
                  {missing.length} of {doc.clauses.length} clauses still need a
                  tick.
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
