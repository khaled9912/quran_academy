/**
 * The public price list, exactly as /api/pricing returns it. Both the server
 * render of the marketing pages and a signed-in student's payment screen read
 * this shape, so the figure shown and the currency offered are always the
 * server's answer rather than anything the app remembers.
 *
 * The three rule numbers are the cancellation windows the academy enforces, and
 * the same ones the signed agreements are filled from.
 */

export interface PricedPlan {
  daysPerWeek: number;
  classesPerMonth: number;
  monthlyAmount: number;
}

/** What /api/pricing answers, before a page decides what it can show. */
export interface RawPricing {
  currency?: string;
  currencies?: string[];
  plans?: PricedPlan[];
  cardCheckout?: boolean;
  freeCancelHours?: number;
  teacherNoticeHours?: number;
  noShowGraceMinutes?: number;
}

/** The cancellation windows, in hours and minutes. */
export interface LessonRules {
  freeCancelHours: number;
  teacherNoticeHours: number;
  noShowGraceMinutes: number;
}

export interface PriceList extends LessonRules {
  /** The currency an invoice would be issued in for this visitor. */
  currency: string;
  /** Every currency with a complete price table, for a currency switcher. */
  currencies: string[];
  plans: PricedPlan[];
  /** Whether a card can actually be taken in `currency` on this host. */
  cardCheckout: boolean;
}
