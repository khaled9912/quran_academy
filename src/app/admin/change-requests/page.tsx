"use client";

import { useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import {
  approveChangeRequest,
  getAdminChangeRequests,
  rejectChangeRequest,
} from "@/services/scheduling.service";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";
import { formatWeeklySlot } from "@/lib/utils";
import type { ChangeRequestStatus } from "@/types/scheduling";

const TABS: { value: ChangeRequestStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Declined" },
];

const statusStyles: Record<ChangeRequestStatus, string> = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

const statusLabels: Record<ChangeRequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Declined",
};

export default function AdminChangeRequestsPage() {
  const { role } = useAuth();
  const canManage = role === "admin" || role === "super_admin";
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<ChangeRequestStatus>("pending");
  const [notice, setNotice] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const requestsQuery = useQuery({
    queryKey: ["change-requests", "admin", tab],
    queryFn: () => getAdminChangeRequests(tab),
    enabled: canManage,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["change-requests"] }),
      queryClient.invalidateQueries({ queryKey: ["lessons"] }),
      queryClient.invalidateQueries({ queryKey: ["availability"] }),
      queryClient.invalidateQueries({ queryKey: ["series"] }),
      queryClient.invalidateQueries({ queryKey: ["teachers"] }),
      queryClient.invalidateQueries({ queryKey: ["teacher-profile"] }),
    ]);
  };

  const approveMutation = useMutation({
    mutationFn: approveChangeRequest,
    onSuccess: async () => {
      setNotice(
        "Change approved. The student's weekly lessons now use the new time."
      );
      await invalidate();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectChangeRequest(id, reason),
    onSuccess: async () => {
      setNotice(
        "Change declined. The student's original weekly time stays booked."
      );
      setRejectingId(null);
      setNote("");
      await invalidate();
    },
  });

  const items = requestsQuery.data ?? [];
  const error =
    requestsQuery.error ??
    approveMutation.error ??
    rejectMutation.error ??
    null;

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
            <h1 className="mt-2 text-3xl font-bold">Time change requests</h1>
            <p className="mt-2 max-w-2xl text-foreground/70">
              Students ask the academy to move a weekly time. Check the new slot
              with the teacher, then approve or decline here.
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
              onClick={() => {
                setNotice("");
                setRejectingId(null);
                setTab(option.value);
              }}
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

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
          >
            {error instanceof Error
              ? error.message
              : "Unable to process the request."}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="mt-6 rounded-xl bg-green-500/10 p-4 text-sm text-green-800 dark:text-green-300"
          >
            {notice}
          </p>
        )}

        <section className="mt-6 space-y-3">
          {requestsQuery.isLoading ? (
            <p className="text-sm text-foreground/60">Loading requests…</p>
          ) : items.length ? (
            items.map((item) => {
              const busy =
                (approveMutation.isPending &&
                  approveMutation.variables === item.id) ||
                (rejectMutation.isPending &&
                  rejectMutation.variables?.id === item.id);
              const rejecting = rejectingId === item.id;
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
                        <span className="font-semibold">Current:</span>{" "}
                        {formatWeeklySlot(
                          item.currentDayOfWeek,
                          item.currentStartsAtTime,
                          item.currentEndsAtTime
                        )}
                      </p>
                      <p className="mt-1 text-sm text-foreground/70">
                        <span className="font-semibold">Requested:</span>{" "}
                        {formatWeeklySlot(
                          item.requestedDayOfWeek,
                          item.requestedStartsAtTime,
                          item.requestedEndsAtTime
                        )}
                      </p>
                      <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                        Requested{" "}
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

                  {item.status === "pending" && (
                    <>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          disabled={busy}
                          onClick={() => {
                            setNotice("");
                            approveMutation.mutate(item.id);
                          }}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#1c5145] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-500"
                        >
                          <Check size={16} />
                          {approveMutation.isPending &&
                          approveMutation.variables === item.id
                            ? "Saving…"
                            : "Approve change"}
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => {
                            setNotice("");
                            setRejectingId(rejecting ? null : item.id);
                            setNote("");
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-600 disabled:opacity-50 dark:text-red-400"
                        >
                          <X size={16} /> Decline
                        </button>
                      </div>
                      {rejecting && (
                        <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/5 p-3">
                          <label className="block text-sm font-semibold">
                            Note for the student (optional)
                            <textarea
                              value={note}
                              onChange={(event) => setNote(event.target.value)}
                              rows={2}
                              placeholder="Why can this time not be changed?"
                              className="mt-2 w-full rounded-xl border border-card-border bg-background px-3 py-2 font-normal text-foreground placeholder:text-foreground/40 outline-none focus:border-red-500"
                            />
                          </label>
                          <div className="mt-2 flex gap-2">
                            <button
                              disabled={rejectMutation.isPending}
                              onClick={() => {
                                setNotice("");
                                rejectMutation.mutate({
                                  id: item.id,
                                  reason: note,
                                });
                              }}
                              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            >
                              {rejectMutation.isPending &&
                              rejectMutation.variables?.id === item.id
                                ? "Saving…"
                                : "Confirm decline"}
                            </button>
                            <button
                              onClick={() => setRejectingId(null)}
                              className="rounded-xl border border-card-border px-4 py-2 text-sm font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-card-border bg-card-bg p-10 text-center text-foreground/60">
              {tab === "pending"
                ? "No time change requests are waiting for the academy."
                : `No ${tab === "rejected" ? "declined" : tab} requests yet.`}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
