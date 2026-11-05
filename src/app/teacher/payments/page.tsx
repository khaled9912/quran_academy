"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Save, Wallet } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  getTeacherBilling,
  savePayoutDetails,
} from "@/services/billing.service";
import type { TeacherBilling, TeacherPayoutInput } from "@/types/billing";

const egp = (value: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

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

const toForm = (billing?: TeacherBilling): TeacherPayoutInput => ({
  instaPayAccount: billing?.payoutDetails.instaPayAccount ?? "",
  vodafoneCashNumber: billing?.payoutDetails.vodafoneCashNumber ?? "",
  bankName: billing?.payoutDetails.bankName ?? "",
  bankAccountHolder: billing?.payoutDetails.bankAccountHolder ?? "",
  bankIban: billing?.payoutDetails.bankIban ?? "",
});

const fields: {
  key: keyof TeacherPayoutInput;
  label: string;
  placeholder: string;
}[] = [
  {
    key: "instaPayAccount",
    label: "InstaPay",
    placeholder: "name@instapay or phone",
  },
  {
    key: "vodafoneCashNumber",
    label: "Vodafone Cash",
    placeholder: "01xxxxxxxxx",
  },
  { key: "bankName", label: "Bank name", placeholder: "e.g. Banque Misr" },
  {
    key: "bankAccountHolder",
    label: "Account holder",
    placeholder: "Name on the account",
  },
  { key: "bankIban", label: "IBAN", placeholder: "EG..." },
];

export default function TeacherPaymentsPage() {
  const { role } = useAuth();
  const isTeacher = role === "teacher";
  const [month, setMonth] = useState<string | undefined>(undefined);

  const billingQuery = useQuery({
    queryKey: ["billing", "teacher", month ?? "latest"],
    queryFn: () => getTeacherBilling(month),
    enabled: isTeacher,
  });

  const billing: TeacherBilling | undefined = billingQuery.data;

  if (!isTeacher) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        The monthly earnings page is for teachers.
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 text-foreground">
      <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Monthly earnings</h1>
          <p className="text-lg text-foreground opacity-75">
            Your completed lessons for the month, what the academy will pay you,
            and where to send the transfer.
          </p>
        </div>

        {billingQuery.isLoading ? (
          <p className="text-foreground opacity-70">Loading your earnings…</p>
        ) : billingQuery.isError ? (
          <div className="rounded-2xl border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-red-800 dark:text-red-300">
            {billingQuery.error instanceof Error
              ? billingQuery.error.message
              : "Unable to load your earnings."}
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
              <label htmlFor="earnings-month" className="text-sm font-semibold">
                Month
              </label>
              <select
                id="earnings-month"
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
              <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-semibold text-green-700 dark:text-green-400">
                {billing.lessons.length} lesson
                {billing.lessons.length === 1 ? "" : "s"} ·{" "}
                {egp(billing.totalEgp)}
              </span>
              <span className="text-sm text-foreground opacity-70">
                {billing.payoutPerLessonEgp > 0
                  ? `${egp(billing.payoutPerLessonEgp)} per lesson`
                  : "Payout rate not set yet"}
              </span>
            </div>

            {billing.payoutPerLessonEgp <= 0 ? (
              <div className="mb-6 rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4 text-amber-900 dark:text-amber-300">
                The academy has not set your per-lesson rate yet, so this
                summary shows 0. Contact the academy if this looks wrong.
              </div>
            ) : null}

            {!billing.hasPayoutDetails ? (
              <div className="mb-6 rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4 text-amber-900 dark:text-amber-300">
                Add at least one payout method below so the academy can transfer
                your earnings.
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-5">
              <section className="rounded-3xl border border-card-border bg-card-bg p-6 lg:col-span-3">
                <h2 className="mb-1 text-xl font-semibold">
                  {monthLabel(billing.month)}
                </h2>
                <p className="mb-5 text-sm text-foreground opacity-70">
                  Lessons marked completed in this month. Trial lessons are paid
                  to you as usual.
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
                          <th className="py-2 pr-4 font-semibold">Student</th>
                          <th className="py-2 pr-4 font-semibold">Lesson</th>
                          <th className="py-2 text-right font-semibold">
                            Payout
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
                              {lesson.studentName || "Student"}
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
                              {egp(lesson.amount)}
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
                            Total
                          </td>
                          <td className="pt-4 text-right text-lg font-bold">
                            {egp(billing.totalEgp)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                {!billing.monthClosed ? (
                  <p className="mt-4 text-sm text-foreground opacity-60">
                    This month is still in progress; the total will grow as more
                    lessons complete.
                  </p>
                ) : null}
              </section>

              <aside className="rounded-3xl border border-card-border bg-card-bg p-6 lg:col-span-2">
                <h2 className="mb-1 flex items-center gap-2 text-xl font-semibold">
                  <Wallet size={20} />
                  Payout details
                </h2>
                <PayoutForm key={billing.month} billing={billing} />
              </aside>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function PayoutForm({ billing }: { billing: TeacherBilling }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<TeacherPayoutInput>(() => toForm(billing));
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const saved = toForm(billing);
  const dirty = fields.some((field) => saved[field.key] !== form[field.key]);
  const hasAnyMethod = fields.some(
    (field) => form[field.key].trim().length > 0
  );

  const saveMutation = useMutation({
    mutationFn: () => savePayoutDetails(form),
    onSuccess: async () => {
      setError("");
      setNotice(
        "Payout details saved. The academy will use them for your transfers."
      );
      await queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
    onError: (mutationError) => {
      setNotice("");
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to save your payout details."
      );
    },
  });

  return (
    <>
      <p className="mb-4 text-sm text-foreground opacity-70">
        Fill in any method that works for you. InstaPay, Vodafone Cash, or an
        Egyptian bank account.
      </p>

      <div className="space-y-3">
        {fields.map((field) => (
          <label key={field.key} className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-foreground opacity-60">
              {field.label}
            </span>
            <input
              value={form[field.key]}
              onChange={(event) => {
                setNotice("");
                setForm((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }));
              }}
              maxLength={field.key === "bankIban" ? 64 : 120}
              placeholder={field.placeholder}
              className="w-full rounded-xl border border-card-border bg-background px-3 py-2 text-sm text-foreground focus:border-green-500 focus:outline-none"
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending || !dirty || !hasAnyMethod}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
      >
        {saveMutation.isSuccess && !dirty ? (
          <CheckCircle2 size={16} />
        ) : (
          <Save size={16} />
        )}
        {saveMutation.isPending
          ? "Saving…"
          : saveMutation.isSuccess && !dirty
            ? "Saved"
            : "Save payout details"}
      </button>

      {!hasAnyMethod ? (
        <p className="mt-2 text-xs text-foreground opacity-60">
          Add at least one method before saving.
        </p>
      ) : null}

      {notice ? (
        <p className="mt-3 rounded-xl bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}
    </>
  );
}
