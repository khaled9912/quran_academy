import { headers } from "next/headers";

import { PRICING_HIDDEN_COUNTRIES } from "@/lib/plans";
import { registrationCountryFromHeaders } from "@/lib/registration";

/**
 * Whether this visitor must be shown plans without figures. Prices are hidden
 * from the countries where the academy recruits its teachers.
 *
 * The geo header comes from the hosting provider, so this is a deterrent rather
 * than a control: a VPN, or a relay that exits outside the country, gets around
 * it. Search engines crawl from elsewhere and see the priced pages.
 */
export async function pricingHidden() {
  const country = registrationCountryFromHeaders(await headers());
  return country !== null && PRICING_HIDDEN_COUNTRIES.includes(country);
}
