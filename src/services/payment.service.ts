import { backendFetch } from "@/lib/backend-client";
import type {
  CheckoutTicket,
  InvoiceView,
  PaymentStatus,
  PlanPriceBoard,
  PlanPriceSaveResult,
} from "@/types/payment";

const withQuery = (
  path: string,
  params: Record<string, string | undefined>
) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const suffix = query.toString();
  return suffix ? `${path}?${suffix}` : path;
};

/**
 * What the billed month costs, priced in the currency the page is showing. The
 * month is the last one that has ended. Nothing is issued by reading this: it
 * answers for a bill that does not exist yet.
 */
export const getPlanInvoice = (month?: string, currency?: string) =>
  backendFetch<InvoiceView>(
    withQuery("/api/student/payments/invoice", { month, currency })
  );

/**
 * Ask for the month's bill. Only the currency travels here — the amount, the
 * tier and the month are the server's to decide.
 */
export const issuePlanInvoice = (currency?: string) =>
  backendFetch<InvoiceView>("/api/student/payments/invoice", {
    method: "POST",
    body: JSON.stringify({ currency: currency ?? null }),
  });

/** Opens (or reuses) a card checkout for an invoice this student owns. */
export const openCheckout = (invoiceId: string) =>
  backendFetch<CheckoutTicket>(
    `/api/student/payments/invoice/${encodeURIComponent(invoiceId)}/checkout`,
    { method: "POST" }
  );

/**
 * The server's answer about one checkout attempt. This is the only way this
 * screen learns money arrived: the browser's own opinion about a redirect is
 * never enough, and nothing here marks a month paid.
 */
export const getCheckoutStatus = (attemptId: string) =>
  backendFetch<PaymentStatus>(
    `/api/student/payments/attempt/${encodeURIComponent(attemptId)}/status`
  );

/**
 * The price board the desk edits: every tier and charge currency the server will
 * accept, and the rows it currently quotes from.
 */
export const getPlanPrices = () =>
  backendFetch<PlanPriceBoard>("/api/admin/payments/prices");

/**
 * One (tier, currency) price. The figure is the academy's own; a currency the
 * payment account does not take is refused rather than quietly stored.
 */
export const savePlanPrice = (
  daysPerWeek: number,
  currency: string,
  monthlyAmount: number
) =>
  backendFetch<PlanPriceSaveResult>("/api/admin/payments/prices", {
    method: "PUT",
    body: JSON.stringify({ daysPerWeek, currency, monthlyAmount }),
  });
