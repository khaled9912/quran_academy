"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";

import { ApiError } from "@/lib/backend-client";
import { getPlanPrices, savePlanPrice } from "@/services/payment.service";
import { useToast } from "@/providers/toast-provider";
import type { PlanPrice } from "@/types/payment";

const cellKey = (daysPerWeek: number, currency: string) =>
  `${currency}-${daysPerWeek}`;

/** A price is only accepted by the desk if the server could honour it. */
const isPublishable = (value: string) => {
  const amount = Number(value);
  return (
    value.trim().length > 0 &&
    Number.isFinite(amount) &&
    amount > 0 &&
    amount <= 100000 &&
    Math.round(amount * 100) === amount * 100
  );
};

/**
 * The price list every quote and every invoice is drawn from.
 *
 * A currency only reaches a student once all of the tiers carry a price in it,
 * so this screen says which of them are still incomplete rather than letting the
 * desk set one figure and wonder why nothing changed on the plans page.
 */
export function PlanPricesDesk() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const pricesQuery = useQuery({
    queryKey: ["payments", "prices"],
    queryFn: getPlanPrices,
  });

  const board = pricesQuery.data;

  const priceOf = (daysPerWeek: number, currency: string): PlanPrice | undefined =>
    board?.prices.find(
      (price) => price.daysPerWeek === daysPerWeek && price.currency === currency
    );

  const saveMutation = useMutation({
    mutationFn: ({
      daysPerWeek,
      currency,
      amount,
    }: {
      daysPerWeek: number;
      currency: string;
      amount: number;
    }) => savePlanPrice(daysPerWeek, currency, amount),
    onSuccess: async (result) => {
      setDrafts((current) => {
        const next = { ...current };
        delete next[cellKey(result.daysPerWeek, result.currency)];
        return next;
      });
      showToast(
        result.openInvoicesUsingOldPrice > 0
          ? `Price saved. ${result.openInvoicesUsingOldPrice} bill${
              result.openInvoicesUsingOldPrice === 1 ? "" : "s"
            } already out keeps the old figure.`
          : "Price saved.",
        "success"
      );
      await queryClient.invalidateQueries({ queryKey: ["payments", "prices"] });
      await queryClient.invalidateQueries({ queryKey: ["pricing"] });
    },
    onError: (mutationError) => {
      if (!(mutationError instanceof ApiError)) {
        showToast("The price could not be saved. Please try again.", "error");
      }
    },
  });

  if (pricesQuery.isPending) {
    return (
      <p className="flex items-center gap-2 text-sm text-foreground opacity-70">
        <Loader2 size={16} className="animate-spin" />
        Loading the price list…
      </p>
    );
  }

  if (pricesQuery.isError || !board) {
    return (
      <p className="text-sm text-foreground opacity-70">
        The price list could not be loaded.{" "}
        <button
          type="button"
          onClick={() => void pricesQuery.refetch()}
          className="underline"
        >
          Try again
        </button>
      </p>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-foreground opacity-70">
        The monthly price of each plan, per currency a cardholder can be charged
        in. Students see a currency only once every plan has a price in it.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-card-border text-foreground opacity-60">
            <tr>
              <th className="py-2 pr-3 font-semibold">Plan</th>
              {board.currencies.map((currency) => (
                <th key={currency} className="py-2 pr-3 font-semibold">
                  {currency}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {board.tiers.map((daysPerWeek) => (
              <tr
                key={daysPerWeek}
                className="border-b border-card-border/60 last:border-0"
              >
                <td className="py-2 pr-3 font-medium">
                  {daysPerWeek} days a week
                </td>
                {board.currencies.map((currency) => {
                  const saved = priceOf(daysPerWeek, currency);
                  const draft =
                    drafts[cellKey(daysPerWeek, currency)] ??
                    (saved ? String(saved.monthlyAmount) : "");
                  const amount = Number(draft);
                  const dirty =
                    !saved || Math.abs(saved.monthlyAmount - amount) > 0.0001;
                  return (
                    <td key={currency} className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <input
                          value={draft}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [cellKey(daysPerWeek, currency)]:
                                event.target.value,
                            }))
                          }
                          inputMode="decimal"
                          placeholder="—"
                          aria-label={`${daysPerWeek} days a week in ${currency}`}
                          className="w-24 rounded-xl border border-card-border bg-background px-3 py-2 text-foreground focus:border-green-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            saveMutation.mutate({
                              daysPerWeek,
                              currency,
                              amount,
                            })
                          }
                          disabled={
                            !isPublishable(draft) ||
                            !dirty ||
                            saveMutation.isPending
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl border border-card-border px-3 py-2 text-xs font-semibold transition hover:bg-green-500/10 disabled:opacity-40"
                        >
                          <Save size={14} />
                          Save
                        </button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-4 space-y-1 text-sm text-foreground opacity-70">
        {board.currencies.map((currency) => {
          const priced = board.tiers.filter(
            (daysPerWeek) => !!priceOf(daysPerWeek, currency)
          ).length;
          return (
            <li key={currency}>
              {currency}: {priced} of {board.tiers.length} plans priced
              {priced === board.tiers.length
                ? " — students are quoted in it."
                : " — not shown to students yet."}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
