/**
 * The plan invoice and the card payment attempts against it, as
 * /api/student/payments describes them.
 */

export type InvoiceStatus = "open" | "awaiting_payment" | "paid" | "voided";

export type AttemptStatus =
  | "pending"
  | "captured"
  | "failed"
  | "voided"
  | "refunded";

export interface PaymentAttempt {
  id: string;
  provider: string;
  status: AttemptStatus;
  /** Minor units, e.g. 4400 for $44.00. */
  amountCents: number;
  currency: string;
  createdAt: string;
  confirmedAt: string | null;
  /** What the cardholder was actually shown, recorded but never compared to. */
  presentmentAmountCents: number | null;
  presentmentCurrency: string | null;
  failureReason: string | null;
}

export interface PaymentInvoice {
  id: string;
  /** Academy-clock month key, e.g. 2026-11. */
  month: string;
  daysPerWeek: number;
  currency: string;
  amount: number;
  status: InvoiceStatus;
  note: string | null;
  issuedAt: string;
  paidAt: string | null;
  attempts: PaymentAttempt[];
}

export interface InvoiceView {
  month: string;
  /** 0 until the academy has a plan on record for this student. */
  daysPerWeek: number;
  currency: string;
  amount: number;
  invoice: PaymentInvoice | null;
}

export interface CheckoutTicket {
  invoiceId: string;
  transactionId: string;
  clientSecret: string;
  publishableKey: string;
  providerReference: string;
  currency: string;
  amount: number;
  /** When Stripe stops accepting this session; null from an older server. */
  expiresAt: string | null;
}

export interface PaymentStatus {
  invoiceId: string;
  invoiceStatus: InvoiceStatus;
  /** The only answer this screen treats as money received. */
  paid: boolean;
  providerStatus: string;
  providerReached: boolean;
}

export interface PlanPrice {
  daysPerWeek: number;
  currency: string;
  monthlyAmount: number;
  updatedAt: string;
  updatedByName: string | null;
}

/** The board the desk edits: what may be priced, and what already is. */
export interface PlanPriceBoard {
  /** The plan tiers an invoice can be priced from, in the server's own order. */
  tiers: number[];
  /** Charge currencies the payment account accepts. */
  currencies: string[];
  prices: PlanPrice[];
}

export interface PlanPriceSaveResult {
  daysPerWeek: number;
  currency: string;
  monthlyAmount: number;
  /** Bills already out at the previous figure, so the desk knows what it changed. */
  openInvoicesUsingOldPrice: number;
}
