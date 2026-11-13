export const LESSON_MINUTES = 30;

/**
 * Visitor countries that see the plans page without figures. The academy's
 * teachers are recruited in these countries, and student pricing is not
 * published to them.
 */
export const PRICING_HIDDEN_COUNTRIES = ["EG"];

export type Plan = {
  id: string;
  daysPerWeek: number;
  classesPerMonth: number;
  priceUsd: number;
  popular?: boolean;
};

export const plans: Plan[] = [
  { id: "two-days", daysPerWeek: 2, classesPerMonth: 8, priceUsd: 38 },
  { id: "three-days", daysPerWeek: 3, classesPerMonth: 12, priceUsd: 44 },
  {
    id: "four-days",
    daysPerWeek: 4,
    classesPerMonth: 16,
    priceUsd: 50,
    popular: true,
  },
  { id: "five-days", daysPerWeek: 5, classesPerMonth: 20, priceUsd: 56 },
];

export const perClassUsd = (plan: Plan) =>
  plan.priceUsd / plan.classesPerMonth;

export const usd = (value: number) =>
  Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
