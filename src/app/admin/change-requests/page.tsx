"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { getAdminChangeRequests } from "@/services/scheduling.service";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";
import { formatWeeklySlot } from "@/lib/utils";
import type { ChangeRequestStatus } from "@/types/scheduling";

const TABS: { value: ChangeRequestStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "applied", label: "Applied" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Declined" },
];

const statusStyles: Record<ChangeRequestStatus, string> = {
  applied:
    "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

const statusLabels: Record<ChangeRequestStatus, string> = {
  applied: "Applied",
  pending: "Waiting",
  approved: "Approved",
  rejected: "Declined",
};

export default function AdminChangeRequestsPage() {
  const { role } = useAuth();
  const canManage = role === "admin" || role === "super_admin";
  const [tab, setTab] = useState<ChangeRequestStatus | "all">("all");

  const requestsQuery = useQuery({
    queryKey: ["change-requests", "admin", tab],
    queryFn: () => getAdminChangeRequests(tab === "all" ? undefined : tab),
    enabled: canManage,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });

  const items = requestsQuery.data ?? [];

  if (!canManage)
    return (
      <main className="mx-auto max-w-5xl px-5 py-16">
        Admin access is required.
      </main>
    );

  return (
    <main className="min-h-[75vh] bg-background px-5 py-12 text-foreground md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-amber-700 dark:text-amber-300">
              Admin portal
            </p>
            <h1 className="mt-2 text-3xl font-bold">Time changes</h1>
            <p className="mt-2 max-w-2xl text-foreground/70">
              Students move their own weekly time, and can only pick a slot
              their teacher has published. The new time is booked the moment
              they ask, so this is the record rather than a queue.
            </p>
          </div>
          <button
            onClick={() => void requestsQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold transition hover:border-green-500"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {TABS.map((option) => (
            <button
              key={option.value}
              onClick={() => setTab(option.value)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === option.value
                  ? "bg-[#1c5145] text-white dark:bg-green-600"
                  : "border border-card-border bg-card-bg hover:border-green-500"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {requestsQuery.error && (
          <p
            role="alert"
            className="mt-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
          >
            {requestsQuery.error instanceof Error
              ? requestsQuery.error.message
              : "Unable to load the time changes."}
          </p>
        )}

        <section className="mt-6 space-y-3">
          {requestsQuery.isLoading ? (
            <p className="text-sm text-foreground/60">Loading changes…</p>
          ) : items.length ? (
            items.map((item) => {
              // An applied row moved the series, so its current slot is the
              // requested one; the two only differ on older records.
              const askedForSomethingElse =
                item.currentDayOfWeek !== item.requestedDayOfWeek ||
                item.currentStartsAtTime !== item.requestedStartsAtTime;
              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-card-border bg-card-bg p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-bold">
                        {item.studentName}{" "}
                        <span className="font-normal text-foreground/60">
                          with
                        </span>{" "}
                        {item.teacherName}
                      </p>
                      <p className="mt-2 text-sm text-foreground/70">
                        <span className="font-semibold">Weekly time:</span>{" "}
                        {formatWeeklySlot(
                          item.currentDayOfWeek,
                          item.currentStartsAtTime,
                          item.currentEndsAtTime
                        )}
                      </p>
                      {askedForSomethingElse && (
                        <p className="mt-1 text-sm text-foreground/70">
                          <span className="font-semibold">Asked for:</span>{" "}
                          {formatWeeklySlot(
                            item.requestedDayOfWeek,
                            item.requestedStartsAtTime,
                            item.requestedEndsAtTime
                          )}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                        {item.status === "applied" ? "Moved" : "Requested"}{" "}
                        {new Date(item.createdAt).toLocaleString(undefined, {
                          hour12: true,
                        })}
                      </p>
                      {item.studentNote && (
                        <p className="mt-2 rounded-xl bg-foreground/5 p-3 text-sm text-foreground/70">
                          Student note: {item.studentNote}
                        </p>
                      )}
                      {item.adminNote && (
                        <p className="mt-2 text-sm text-foreground/70">
                          Academy note: {item.adminNote}
                        </p>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status]}`}
                    >
                      {statusLabels[item.status]}
                    </span>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-card-border bg-card-bg p-10 text-center text-foreground/60">
              {tab === "all"
                ? "No weekly time has been moved yet."
                : `No ${statusLabels[tab]} changes yet.`}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
