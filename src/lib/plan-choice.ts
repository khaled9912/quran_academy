import { plans } from "./plans";

const STORAGE_KEY = "pendingPlanDays";

const tiers = new Set(plans.map((plan) => plan.daysPerWeek));

/**
 * The tier a visitor tapped on /plans before they had a student account. The
 * plan is only on record once the academy has a student to attach it to, so the
 * choice waits on this device and the setup wizard opens with it already given.
 */
export function rememberPlanChoice(daysPerWeek: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(daysPerWeek));
  } catch {
    // Private mode or a full quota must not lose the invitation to sign up.
  }
}

/** The tier kept from /plans, or `0` when nothing was tapped. */
export function readPlanChoice(): number {
  if (typeof window === "undefined") return 0;
  try {
    const days = Number(window.localStorage.getItem(STORAGE_KEY));
    return tiers.has(days) ? days : 0;
  } catch {
    return 0;
  }
}

export function clearPlanChoice() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clean up when storage is unavailable.
  }
}
