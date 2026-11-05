"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Landmark, Save, X } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  confirmPaymentClaim,
  getAdminBilling,
  rejectPaymentClaim,
  saveAcademyAccount,
  saveTeacherRate,
} from "@/services/billing.service";
import type {
  AdminBillingOverview,
  TeacherBillingRate,
  TeacherPayoutDetail,
} from "@/types/billing";

const usd = (value: number) => `$${value.toFixed(2)}`;

const egp = (value: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(value);

const monthLabel = (month: string) =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

const recentMonths = () => {
  const now = new Date();
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });
};

const payoutSummary = (details: TeacherPayoutDetail) => {
  const parts = [
    details.instaPayAccount ? `InstaPay: ${details.instaPayAccount}` : "",
    details.vodafoneCashNumber ? `Vodafone: ${details.vodafoneCashNumber}` : "",
    details.bankIban
      ? `${details.bankName || "Bank"} IBAN: ${details.bankIban}`
      : "",
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "No payout details yet";
};

type AccountForm = {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  iban: string;
  swift: string;
  notes: string;
};

const emptyAccount: AccountForm = {
  bankName: "",
  accountHolder: "",
  accountNumber: "",
  iban: "",
  swift: "",
  notes: "",
};

const accountFields: {
  key: keyof AccountForm;
  label: string;
  placeholder: string;
}[] = [
  { key: "bankName", label: "Bank name", placeholder: "Bank of example" },
  {
    key: "accountHolder",
    label: "Account holder",
    placeholder: "Academy legal name",
  },
  { key: "accountNumber", label: "Account number", placeholder: "0000000000" },
  { key: "iban", label: "IBAN", placeholder: "US..." },
  { key: "swift", label: "SWIFT/BIC", placeholder: "XXXXXXXX" },
];

type RateForm = { studentPriceUsd: string; payoutEgp: string };

const toRateForm = (rates: TeacherBillingRate[]): Record<string, RateForm> =>
  Object.fromEntries(
    rates.map((rate) => [
      rate.teacherId,
      {
        studentPriceUsd: String(rate.studentPriceUsd),
        payoutEgp: String(rate.payoutEgp),
      },
    ])
  );

export default function AdminPaymentsPage() {
  const { role } = useAuth();
  const canManage = role === "admin" || role === "super_admin";
  const queryClient = useQueryClient();
  const [month, setMonth] = useState<string | undefined>(undefined);
  const [account, setAccount] = useState<AccountForm>(emptyAccount);
  const [rates, setRates] = useState<Record<string, RateForm>>({});
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [accountNotice, setAccountNotice] = useState("");
  const [error, setError] = useState("");

  const months = useMemo(recentMonths, []);

  const overviewQuery = useQuery({
    queryKey: ["billing", "admin", month ?? "latest"],
    queryFn: () => getAdminBilling(month),
    enabled: canManage,
    // Refetching on focus would overwrite rate fields while an admin is editing.
    refetchOnWindowFocus: false,
  });
  const overview: AdminBillingOverview | undefined = overviewQuery.data;

  useEffect(() => {
    const bank = overview?.bankAccount;
    setAccount(
      bank
        ? {
            bankName: bank.bankName,
            accountHolder: bank.accountHolder,
            accountNumber: bank.accountNumber,
            iban: bank.iban,
            swift: bank.swift,
            notes: bank.notes,
          }
        : emptyAccount
    );
  }, [overview?.bankAccount]);

  useEffect(() => {
    if (overview) setRates(toRateForm(overview.rates));
  }, [overview?.rates]);

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["billing"] });

  const accountMutation = useMutation({
    mutationFn: () => saveAcademyAccount(account),
    onSuccess: async () => {
      setError("");
      setAccountNotice("Dollar account saved. Students now see these details.");
      await refresh();
    },
    onError: (mutationError) => {
      setAccountNotice("");
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to save the academy account."
      );
    },
  });

  const rateMutation = useMutation({
    mutationFn: (input: {
      teacherId: string;
      studentPriceUsd: number;
      payoutEgp: number;
    }) =>
      saveTeacherRate(input.teacherId, {
        studentPriceUsd: input.studentPriceUsd,
        payoutEgp: input.payoutEgp,
      }),
    onSuccess: async () => {
      setError("");
      await refresh();
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to save the rate."
      );
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => confirmPaymentClaim(id),
    onSuccess: async () => {
      setError("");
      await refresh();
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to confirm the payment."
      );
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (input: { id: string; note: string }) =>
      rejectPaymentClaim(input.id, input.note),
    onSuccess: async () => {
      setError("");
      await refresh();
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to reject the payment."
      );
    },
  });

  if (!canManage) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        The payments overview is for admins.
      </main>
    );
  }

  const pending =
    overview?.claims.filter((claim) => claim.status === "pending") ?? [];
  const reviewed =
    overview?.claims.filter((claim) => claim.status !== "pending") ?? [];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 text-foreground">
      <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Payments</h1>
          <p className="text-lg text-foreground opacity-75">
            Set each teacher&apos;s dollar price and EGP payout, keep the
            academy&apos;s dollar account up to date, and confirm student
            transfers.
          </p>
        </div>

        {overviewQuery.isLoading ? (
          <p className="text-foreground opacity-70">Loading billing data…</p>
        ) : overviewQuery.isError ? (
          <div className="rounded-2xl border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-red-800 dark:text-red-300">
            {overviewQuery.error instanceof Error
              ? overviewQuery.error.message
              : "Unable to load billing data."}
            <button
              type="button"
              onClick={() => void overviewQuery.refetch()}
              className="ml-3 underline"
            >
              Try again
            </button>
          </div>
        ) : overview ? (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-3xl border border-card-border bg-card-bg p-6">
                <h2 className="mb-1 flex items-center gap-2 text-xl font-semibold">
                  <Landmark size={20} />
                  Academy dollar account
                </h2>
                <p className="mb-4 text-sm text-foreground opacity-70">
                  Students copy these details into their banking app. Leave a
                  field empty to hide it.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {accountFields.map((field) => (
                    <label key={field.key} className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-foreground opacity-60">
                        {field.label}
                      </span>
                      <input
                        value={account[field.key]}
                        onChange={(event) =>
                          setAccount((current) => ({
                            ...current,
                            [field.key]: event.target.value,
                          }))
                        }
                        maxLength={field.key === "notes" ? 500 : 160}
                        placeholder={field.placeholder}
                        className="w-full rounded-xl border border-card-border bg-background px-3 py-2 text-sm text-foreground focus:border-green-500 focus:outline-none"
                      />
                    </label>
                  ))}
                </div>
                <label className="mt-3 block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-foreground opacity-60">
                    Notes for students
                  </span>
                  <textarea
                    value={account.notes}
                    onChange={(event) =>
                      setAccount((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    maxLength={500}
                    rows={2}
                    placeholder="e.g. Include your full name in the transfer reference."
                    className="w-full rounded-xl border border-card-border bg-background px-3 py-2 text-sm text-foreground focus:border-green-500 focus:outline-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => accountMutation.mutate()}
                  disabled={accountMutation.isPending}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
                >
                  <Save size={16} />
                  {accountMutation.isPending ? "Saving…" : "Save account"}
                </button>
                {accountNotice ? (
                  <p className="mt-3 rounded-xl bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
                    {accountNotice}
                  </p>
                ) : null}
              </section>

              <section className="rounded-3xl border border-card-border bg-card-bg p-6">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl font-semibold">Teacher payouts</h2>
                  <select
                    value={overview.month}
                    onChange={(event) => setMonth(event.target.value)}
                    aria-label="Payout month"
                    className="rounded-xl border border-card-border bg-background px-3 py-2 text-sm text-foreground focus:border-green-500 focus:outline-none"
                  >
                    {months.map((entry) => (
                      <option key={entry} value={entry}>
                        {monthLabel(entry)}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mb-4 text-sm text-foreground opacity-70">
                  Completed lessons per teacher in {monthLabel(overview.month)},
                  paid at each teacher&apos;s EGP rate.
                </p>
                {overview.teacherPayouts.length === 0 ? (
                  <p className="text-foreground opacity-70">No teachers yet.</p>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 border-b border-card-border bg-card-bg text-foreground opacity-60">
                        <tr>
                          <th className="py-2 pr-3 font-semibold">Teacher</th>
                          <th className="py-2 pr-3 text-right font-semibold">
                            Lessons
                          </th>
                          <th className="py-2 text-right font-semibold">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.teacherPayouts.map((payout) => (
                          <tr
                            key={payout.teacherId}
                            className="border-b border-card-border/60 last:border-0 align-top"
                          >
                            <td className="py-3 pr-3">
                              <div className="font-medium">
                                {payout.teacherName}
                              </div>
                              <div className="text-xs text-foreground opacity-60">
                                {payoutSummary(payout.payoutDetails)}
                              </div>
                            </td>
                            <td className="py-3 pr-3 text-right">
                              {payout.lessonCount}
                              {payout.payoutPerLessonEgp > 0
                                ? ` × ${egp(payout.payoutPerLessonEgp)}`
                                : ""}
                            </td>
                            <td className="py-3 text-right font-semibold">
                              {payout.payoutPerLessonEgp > 0
                                ? egp(payout.totalEgp)
                                : "Rate not set"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>

            <section className="mt-6 rounded-3xl border border-card-border bg-card-bg p-6">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-semibold">
                  Payment claims
                  {pending.length > 0 ? (
                    <span className="ml-2 rounded-full bg-amber-100 dark:bg-amber-500/15 px-2.5 py-0.5 text-sm font-semibold text-amber-800 dark:text-amber-300">
                      {pending.length} to review
                    </span>
                  ) : null}
                </h2>
              </div>
              <p className="mb-4 text-sm text-foreground opacity-70">
                Students mark a month as paid after transferring to the dollar
                account. Confirm once you see the money.
              </p>

              {pending.length === 0 ? (
                <p className="text-foreground opacity-70">
                  No payments waiting for review.
                </p>
              ) : (
                <div className="space-y-3">
                  {pending.map((claim) => (
                    <div
                      key={claim.id}
                      className="rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/10 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">
                            {claim.studentName || "Student"}{" "}
                            <span className="text-sm font-normal text-foreground opacity-60">
                              {claim.studentEmail}
                            </span>
                          </p>
                          <p className="text-sm text-foreground opacity-70">
                            {monthLabel(claim.month)} · {usd(claim.amountUsd)} ·{" "}
                            {claim.lessonCount} lesson
                            {claim.lessonCount === 1 ? "" : "s"} · marked{" "}
                            {new Date(claim.claimedAt).toLocaleDateString()}
                          </p>
                          {claim.studentNote ? (
                            <p className="mt-1 text-sm text-foreground opacity-70">
                              Note: {claim.studentNote}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => confirmMutation.mutate(claim.id)}
                            disabled={confirmMutation.isPending}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-green-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
                          >
                            <Check size={15} />
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              rejectMutation.mutate({
                                id: claim.id,
                                note: rejectNotes[claim.id] ?? "",
                              })
                            }
                            disabled={rejectMutation.isPending}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 dark:border-red-500/30 px-3 py-2 text-sm font-semibold text-red-700 dark:text-red-300 transition hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                          >
                            <X size={15} />
                            Reject
                          </button>
                        </div>
                      </div>
                      <input
                        value={rejectNotes[claim.id] ?? ""}
                        onChange={(event) =>
                          setRejectNotes((current) => ({
                            ...current,
                            [claim.id]: event.target.value,
                          }))
                        }
                        maxLength={500}
                        placeholder="Optional rejection note shown to the student"
                        className="mt-3 w-full rounded-xl border border-card-border bg-background px-3 py-2 text-sm text-foreground focus:border-green-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              {reviewed.length > 0 ? (
                <div className="mt-6 overflow-x-auto">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground opacity-60">
                    Recent decisions
                  </h3>
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-card-border text-foreground opacity-60">
                      <tr>
                        <th className="py-2 pr-3 font-semibold">Student</th>
                        <th className="py-2 pr-3 font-semibold">Month</th>
                        <th className="py-2 pr-3 text-right font-semibold">
                          Amount
                        </th>
                        <th className="py-2 pr-3 font-semibold">Status</th>
                        <th className="py-2 font-semibold">Reviewed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewed.map((claim) => (
                        <tr
                          key={claim.id}
                          className="border-b border-card-border/60 last:border-0"
                        >
                          <td className="py-2 pr-3">
                            {claim.studentName || "Student"}
                          </td>
                          <td className="py-2 pr-3">{claim.month}</td>
                          <td className="py-2 pr-3 text-right">
                            {usd(claim.amountUsd)}
                          </td>
                          <td className="py-2 pr-3">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                claim.status === "confirmed"
                                  ? "bg-green-100 dark:bg-green-500/15 text-green-800 dark:text-green-300"
                                  : "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300"
                              }`}
                            >
                              {claim.status}
                            </span>
                            {claim.adminNote ? (
                              <span className="ml-2 text-xs text-foreground opacity-60">
                                {claim.adminNote}
                              </span>
                            ) : null}
                          </td>
                          <td className="py-2 text-foreground opacity-70">
                            {claim.reviewedAt
                              ? new Date(claim.reviewedAt).toLocaleDateString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </section>

            <section className="mt-6 rounded-3xl border border-card-border bg-card-bg p-6">
              <h2 className="mb-1 text-xl font-semibold">Rates</h2>
              <p className="mb-4 text-sm text-foreground opacity-70">
                What students pay per lesson in USD, and what the teacher earns
                per lesson in EGP. Trial lessons are free for students but still
                paid to the teacher.
              </p>
              {overview.rates.length === 0 ? (
                <p className="text-foreground opacity-70">No teachers yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-card-border text-foreground opacity-60">
                      <tr>
                        <th className="py-2 pr-3 font-semibold">Teacher</th>
                        <th className="py-2 pr-3 font-semibold">
                          Student price (USD)
                        </th>
                        <th className="py-2 pr-3 font-semibold">
                          Payout (EGP)
                        </th>
                        <th className="py-2 font-semibold" />
                      </tr>
                    </thead>
                    <tbody>
                      {overview.rates.map((rate) => {
                        const draft = rates[rate.teacherId] ?? {
                          studentPriceUsd: String(rate.studentPriceUsd),
                          payoutEgp: String(rate.payoutEgp),
                        };
                        const studentPrice = Number(draft.studentPriceUsd);
                        const payout = Number(draft.payoutEgp);
                        const valid =
                          Number.isFinite(studentPrice) &&
                          Number.isFinite(payout) &&
                          studentPrice >= 0 &&
                          payout >= 0;
                        const dirty =
                          studentPrice !== rate.studentPriceUsd ||
                          payout !== rate.payoutEgp;
                        return (
                          <tr
                            key={rate.teacherId}
                            className="border-b border-card-border/60 last:border-0"
                          >
                            <td className="py-2 pr-3">
                              <div className="font-medium">
                                {rate.teacherName}
                              </div>
                              <div className="text-xs text-foreground opacity-60">
                                {rate.teacherEmail}
                              </div>
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                value={draft.studentPriceUsd}
                                onChange={(event) =>
                                  setRates((current) => ({
                                    ...current,
                                    [rate.teacherId]: {
                                      ...draft,
                                      studentPriceUsd: event.target.value,
                                    },
                                  }))
                                }
                                type="number"
                                min={0}
                                step="0.01"
                                inputMode="decimal"
                                aria-label={`Student price for ${rate.teacherName}`}
                                className="w-28 rounded-xl border border-card-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-green-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                value={draft.payoutEgp}
                                onChange={(event) =>
                                  setRates((current) => ({
                                    ...current,
                                    [rate.teacherId]: {
                                      ...draft,
                                      payoutEgp: event.target.value,
                                    },
                                  }))
                                }
                                type="number"
                                min={0}
                                step="0.01"
                                inputMode="decimal"
                                aria-label={`Payout for ${rate.teacherName}`}
                                className="w-28 rounded-xl border border-card-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-green-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2">
                              <button
                                type="button"
                                onClick={() =>
                                  rateMutation.mutate({
                                    teacherId: rate.teacherId,
                                    studentPriceUsd: studentPrice,
                                    payoutEgp: payout,
                                  })
                                }
                                disabled={
                                  !dirty || !valid || rateMutation.isPending
                                }
                                className="inline-flex items-center gap-1.5 rounded-xl border border-card-border px-3 py-1.5 text-sm font-semibold transition hover:bg-green-500/10 disabled:opacity-40"
                              >
                                <Save size={14} />
                                Save
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {error ? (
              <p className="mt-4 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
