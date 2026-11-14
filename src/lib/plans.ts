export const LESSON_MINUTES = 30;

/**
 * Visitor countries the academy does not sell to: no prices, no plans page, no
 * student sign-up. The academy recruits its teachers in these countries, so
 * /teach stays open to them.
 */
export const RESTRICTED_COUNTRIES = ["EG"];

/**
 * The tiers /plans sells and the API bills. Prices are not here: they live in
 * the server's price table, which is the same table an invoice is issued from,
 * so a page cannot show a figure the backend would not honour.
 */
export type Plan = {
  id: string;
  daysPerWeek: number;
  classesPerMonth: number;
  popular?: boolean;
};

export const plans: Plan[] = [
  { id: "two-days", daysPerWeek: 2, classesPerMonth: 8 },
  { id: "three-days", daysPerWeek: 3, classesPerMonth: 12 },
  {
    id: "four-days",
    daysPerWeek: 4,
    classesPerMonth: 16,
    popular: true,
  },
  { id: "five-days", daysPerWeek: 5, classesPerMonth: 20 },
];

/** Spelled out so a sentence can name the money rather than show a bare code. */
const currencyWords: Record<string, string> = {
  USD: "US dollars",
  GBP: "British pounds",
  EUR: "euros",
};

const currencySymbols: Record<string, string> = {
  USD: "$",
  GBP: "£",
  EUR: "€",
};

export const currencyName = (currency: string) =>
  currencyWords[currency] ?? currency;

export const money = (value: number, currency: string) => {
  const symbol = currencySymbols[currency] ?? `${currency} `;
  const decimals = Number.isInteger(value) ? 0 : 2;
  return `${symbol}${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * What one class costs at this price. Prices are per month, and the page quotes
 * the shorter figure beside it because that is what families compare.
 */
export const perClass = (monthlyAmount: number, classesPerMonth: number) =>
  monthlyAmount / classesPerMonth;
