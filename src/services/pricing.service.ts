import { backendFetch } from "@/lib/backend-client";
import type { PriceList } from "@/types/pricing";

/**
 * The public price list as the browser sees it. Passing the visitor's country
 * is what decides the currency, and the answer also says whether this host can
 * take a card at all — a screen must not offer a button it cannot honour.
 */
export const getPublicPricing = (country?: string | null) =>
  backendFetch<PriceList>(
    `/api/pricing${country ? `?country=${encodeURIComponent(country)}` : ""}`
  );
