"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Landmark, Send } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { getStudentBilling, markPaymentSent } from "@/services/billing.service";
import type { AcademyBankAccount, StudentBilling } from "@/types/billing";

const usd = (value: number) =>
  `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const monthLabel = (month: string) =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

const lessonDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

const claimStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-700",
};

const claimLabels: Record<string, string> = {
  pending: "Awaiting academy confirmation",
  confirmed: "Payment confirmed",
  rejected: "Academy could not match the transfer",
};

const bankFields = (bank: AcademyBankAccount) =>
  [
    { label: "Bank", value: bank.bankName },
    { label: "Account holder", value: bank.accountHolder },
    { label: "Account number", value: bank.accountNumber },
    { label: "IBAN", value: bank.iban },
    { label: "SWIFT", value: bank.swift },
  ].filter((field) => field.value.trim().length > 0);

export default function StudentPaymentsPage() {
  const { role } = useAuth();
  const isStudent = role === "student";
  const queryClient = useQueryClient();
  const [month, setMonth] = useState<string | undefined>(undefined);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const billingQuery = useQuery({
    queryKey: ["billing", "student", month ?? "latest"],
    queryFn: () => getStudentBilling(month),
    enabled: isStudent,
  });

  const billing: StudentBilling | undefined = billingQuery.data;
  const bank = billing?.bankAccount ?? null;
  const claim = billing?.claim ?? null;

  const claimMutation = useMutation({
    mutationFn: () => {
      if (!billing) throw new Error("The statement is still loading.");
      return markPaymentSent({ month: billing.month, note });
    },
    onSuccess: async () => {
      setError("");
      setNotice(
        "Thanks — the academy will check the transfer and confirm this month."
      );
      setNote("");
      await queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
    onError: (mutationError) => {
      setNotice("");
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to mark the payment as sent."
      );
    },
  });

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(
        () => setCopied((current) => (current === key ? null : current)),
        1600
      );
    } catch {
      setError("Could not copy. Select the text and copy it manually.");
    }
  };

  const allDetails = useMemo(() => {
    if (!bank) return "";
    return bankFields(bank)
      .map((field) => `${field.label}: ${field.value}`)
      .join("\n");
  }, [bank]);

  if (!isStudent) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        The monthly payment page is for students.
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 text-foreground">
      <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Monthly payment</h1>
          <p className="text-lg text-foreground opacity-75">
            Your completed lessons for the month, the amount due, and the
            academy&apos;s dollar account to transfer to.
          </p>
        </div>

        {billingQuery.isLoading ? (
          <p className="text-foreground opacity-70">Loading your statement…</p>
        ) : billingQuery.isError ? (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-800">
            {billingQuery.error instanceof Error
              ? billingQuery.error.message
              : "Unable to load the monthly statement."}
            <button
              type="button"
              onClick={() => void billingQuery.refetch()}
              className="ml-3 underline"
            >
              Try again
            </button>
          </div>
        ) : billing ? (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <label htmlFor="billing-month" className="text-sm font-semibold">
                Month
              </label>
              <select
                id="billing-month"
                value={billing.month}
                onChange={(event) => setMonth(event.target.value)}
                className="rounded-xl border border-card-border bg-background px-4 py-2.5 text-foreground focus:border-green-500 focus:outline-none"
              >
                {billing.months.map((entry) => (
                  <option key={entry.month} value={entry.month}>
                    {monthLabel(entry.month)}
                    {entry.month === billing.months[0]?.month &&
                    !billing.monthClosed
                      ? " (in progress)"
                      : ""}
                  </option>
                ))}
              </select>
              <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-semibold text-green-700">
                {billing.lessons.length} lesson
                {billing.lessons.length === 1 ? "" : "s"} ·{" "}
                {usd(billing.totalUsd)} due
              </span>
              {!billing.monthClosed ? (
                <span className="text-sm text-foreground opacity-70">
                  This month is still in progress.
                </span>
              ) : null}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <section className="rounded-3xl border border-card-border bg-card-bg p-6 lg:col-span-2">
                <h2 className="mb-1 text-xl font-semibold">
                  {monthLabel(billing.month)}
                </h2>
                <p className="mb-5 text-sm text-foreground opacity-70">
                  Lessons completed in this month. Trial lessons are free.
                </p>

                {billing.lessons.length === 0 ? (
                  <p className="text-foreground opacity-70">
                    No completed lessons in this month.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-card-border text-foreground opacity-60">
                        <tr>
                          <th className="py-2 pr-4 font-semibold">Date</th>
                          <th className="py-2 pr-4 font-semibold">Teacher</th>
                          <th className="py-2 pr-4 font-semibold">Lesson</th>
                          <th className="py-2 text-right font-semibold">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {billing.lessons.map((lesson) => (
                          <tr
                            key={lesson.id}
                            className="border-b border-card-border/60 last:border-0"
                          >
                            <td className="py-3 pr-4">
                              {lessonDate(lesson.startsAt)}
                            </td>
                            <td className="py-3 pr-4">
                              {lesson.teacherName || "Academy teacher"}
                            </td>
                            <td className="py-3 pr-4 text-foreground opacity-70">
                              {lesson.isTrial
                                ? "Trial lesson"
                                : new Date(lesson.startsAt).toLocaleTimeString(
                                    undefined,
                                    {
                                      hour: "numeric",
                                      minute: "2-digit",
                                      hour12: true,
                                    }
                                  )}
                            </td>
                            <td className="py-3 text-right font-semibold">
                              {lesson.isTrial ? "Free" : usd(lesson.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td
                            colSpan={3}
                            className="pt-4 text-right font-semibold"
                          >
                            Total due
                          </td>
                          <td className="pt-4 text-right text-lg font-bold">
                            {usd(billing.totalUsd)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </section>

              <aside className="rounded-3xl border border-card-border bg-card-bg p-6">
                <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
                  <Landmark size={20} />
                  Dollar account
                </h2>

                {bank ? (
                  <>
                    <p className="mb-4 text-sm text-foreground opacity-70">
                      Transfer {usd(billing.totalUsd)} using your banking app,
                      then mark the payment as sent below.
                    </p>
                    <dl className="space-y-3 text-sm">
                      {bankFields(bank).map((field) => (
                        <div
                          key={field.label}
                          className="rounded-xl border border-card-border bg-background px-3 py-2"
                        >
                          <dt className="text-xs uppercase tracking-wide text-foreground opacity-60">
                            {field.label}
                          </dt>
                          <dd className="mt-1 flex items-center justify-between gap-2">
                            <span className="break-all font-medium">
                              {field.value}
                            </span>
                            <button
                              type="button"
                              aria-label={`Copy ${field.label}`}
                              onClick={() =>
                                void copy(field.label, field.value)
                              }
                              className="shrink-0 rounded-lg border border-card-border p-1.5 text-foreground opacity-70 transition hover:opacity-100"
                            >
                              {copied === field.label ? (
                                <Check size={14} className="text-green-600" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </dd>
                        </div>
                      ))}
                    </dl>
                    {bank.notes ? (
                      <p className="mt-3 whitespace-pre-line text-sm text-foreground opacity-70">
                        {bank.notes}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void copy("all", allDetails)}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-card-border px-4 py-2.5 text-sm font-semibold transition hover:bg-green-500/10"
                    >
                      {copied === "all" ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                      {copied === "all"
                        ? "Copied all details"
                        : "Copy all details"}
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-foreground opacity-70">
                    The academy has not added its dollar account yet. Please
                    contact the academy for transfer details.
                  </p>
                )}
              </aside>
            </div>

            <section className="mt-6 rounded-3xl border border-card-border bg-card-bg p-6">
              <h2 className="mb-1 text-xl font-semibold">Payment status</h2>
              {claim ? (
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                        claimStyles[claim.status] ?? claimStyles.pending
                      }`}
                    >
                      {claimLabels[claim.status] ?? claim.status}
                    </span>
                    <p className="mt-2 text-sm text-foreground opacity-70">
                      Marked as sent on{" "}
                      {new Date(claim.claimedAt).toLocaleDateString()} for{" "}
                      {usd(claim.amountUsd)} ({claim.lessonCount} lesson
                      {claim.lessonCount === 1 ? "" : "s"}).
                    </p>
                    {claim.studentNote ? (
                      <p className="mt-1 text-sm text-foreground opacity-70">
                        Your note: {claim.studentNote}
                      </p>
                    ) : null}
                    {claim.status === "rejected" && claim.adminNote ? (
                      <p className="mt-1 text-sm text-red-700">
                        Academy note: {claim.adminNote}
                      </p>
                    ) : null}
                  </div>
                  {claim.status === "rejected" && billing.canClaim ? (
                    <button
                      type="button"
                      onClick={() => claimMutation.mutate()}
                      disabled={claimMutation.isPending}
                      className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
                    >
                      <Send size={16} />
                      Mark as sent again
                    </button>
                  ) : null}
                </div>
              ) : !billing.monthClosed ? (
                <p className="mt-2 text-sm text-foreground opacity-70">
                  You can mark this month as paid after it ends, once all
                  lessons are completed.
                </p>
              ) : billing.canClaim ? (
                <div className="mt-3">
                  <p className="mb-3 text-sm text-foreground opacity-70">
                    Transferred {usd(billing.totalUsd)}? Tell the academy so
                    they can match it to your account.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      maxLength={500}
                      placeholder="Optional note, e.g. sender name or transfer reference"
                      className="flex-1 rounded-xl border border-card-border bg-background px-4 py-2.5 text-foreground focus:border-green-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => claimMutation.mutate()}
                      disabled={claimMutation.isPending}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
                    >
                      <Send size={16} />
                      {claimMutation.isPending
                        ? "Sending…"
                        : "I've sent the payment"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-foreground opacity-70">
                  There is nothing to pay for this month.
                </p>
              )}
              {notice ? (
                <p className="mt-3 rounded-xl bg-green-500/10 px-3 py-2 text-sm text-green-700">
                  {notice}
                </p>
              ) : null}
              {error ? (
                <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
