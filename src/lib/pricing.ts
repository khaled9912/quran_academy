import { headers } from "next/headers";

import { plans, type Plan } from "@/lib/plans";
import {
  registrationCountryFromCookie,
  registrationCountryFromHeaders,
} from "@/lib/registration";
import type { LessonRules, PriceList, RawPricing } from "@/types/pricing";

/** One of the academy's tiers, with the server's price for it. */
export type PricedTier = Plan & { monthlyAmount: number };

/** A backend blip must not turn a marketing page into a hanging page. */
const PRICING_TIMEOUT_MS = 4_000;

/**
 * Prices change when an admin edits the table, not when a visitor reloads, so
 * one read serves many visitors. Each country/currency variant is its own
 * cached entry because it is its own URL.
 */
const PRICING_REVALIDATE_SECONDS = 300;

const backendOrigin = () =>
  (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").replace(/\/$/, "");

const asCurrencyCode = (value: string | null | undefined) => {
  const code = value?.trim().toUpperCase() ?? "";
  return /^[A-Z]{3}$/.test(code) ? code : null;
};

/** What the server would answer for this visitor, before any page checks it. */
async function fetchPricing(
  requestedCurrency?: string | null
): Promise<RawPricing | null> {
  const origin = backendOrigin();
  if (!origin) return null;

  const allHeaders = await headers();
  const country =
    registrationCountryFromHeaders(allHeaders) ??
    registrationCountryFromCookie(allHeaders.get("cookie"));
  const currency = asCurrencyCode(requestedCurrency);

  const query = new URLSearchParams();
  if (country) query.set("country", country);
  if (currency) query.set("currency", currency);
  const suffix = query.toString();

  try {
    const response = await fetch(
      `${origin}/api/pricing${suffix ? `?${suffix}` : ""}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: PRICING_REVALIDATE_SECONDS },
        signal: AbortSignal.timeout(PRICING_TIMEOUT_MS),
      }
    );
    if (!response.ok) return null;
    return (await response.json()) as RawPricing;
  } catch {
    return null;
  }
}

const asWholeNumber = (value: number | undefined, fallback: number) =>
  typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : fallback;

/**
 * The windows the engine was built with, for the one case the live row cannot
 * answer: the backend is unreachable. Anything else is the operator's number.
 */
const DEFAULT_RULES: LessonRules = {
  freeCancelHours: 12,
  teacherNoticeHours: 12,
  noShowGraceMinutes: 10,
};

const rulesOf = (pricing: RawPricing | null): LessonRules => ({
  freeCancelHours: asWholeNumber(
    pricing?.freeCancelHours,
    DEFAULT_RULES.freeCancelHours
  ),
  teacherNoticeHours: asWholeNumber(
    pricing?.teacherNoticeHours,
    DEFAULT_RULES.teacherNoticeHours
  ),
  noShowGraceMinutes: asWholeNumber(
    pricing?.noShowGraceMinutes,
    DEFAULT_RULES.noShowGraceMinutes
  ),
});

/**
 * What the server would bill this visitor, read from the same rows an invoice is
 * priced from.
 *
 * Returns `null` when the price table cannot be reached or holds nothing for
 * them. Callers then show the plans without figures, which is the same answer a
 * visitor from a hidden-pricing country gets — never a stale number.
 */
export async function getPriceList(
  requestedCurrency?: string | null
): Promise<PriceList | null> {
  const pricing = await fetchPricing(requestedCurrency);
  if (
    !pricing ||
    typeof pricing.currency !== "string" ||
    !pricing.currency ||
    !Array.isArray(pricing.plans) ||
    pricing.plans.length === 0
  ) {
    return null;
  }

  return {
    currency: pricing.currency,
    currencies: Array.isArray(pricing.currencies)
      ? pricing.currencies
      : [pricing.currency],
    plans: pricing.plans,
    cardCheckout: pricing.cardCheckout === true,
    ...rulesOf(pricing),
  };
}

/**
 * The cancellation windows a public answer quotes, from the same rule row the
 * signed agreements are filled from, so a page cannot promise a window the
 * engine does not enforce. Read separately from the price list because a visitor
 * with prices hidden is still bound by the rules.
 */
export async function getLessonRules(): Promise<LessonRules> {
  return rulesOf(await fetchPricing());
}

/**
 * The tiers a page may sell, each with the price the server would bill. A tier
 * with no price for this visitor is left out rather than shown as nothing.
 */
export function pricedTiers(pricing: PriceList | null): PricedTier[] {
  if (!pricing) return [];
  return plans.flatMap((tier) => {
    const priced = pricing.plans.find(
      (plan) => plan.daysPerWeek === tier.daysPerWeek
    );
    return priced ? [{ ...tier, monthlyAmount: priced.monthlyAmount }] : [];
  });
}
