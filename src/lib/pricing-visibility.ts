import { headers } from "next/headers";

import { registrationCountryFromHeaders } from "@/lib/registration";
import { isRestrictedCountry } from "@/lib/restricted-country";

/**
 * Whether this visitor is in a country the academy does not sell to: no prices,
 * no plans page, no student sign-up.
 *
 * The geo header comes from the hosting provider, so this is a deterrent rather
 * than a control: a VPN, or a relay that exits outside the country, gets around
 * it. Search engines crawl from elsewhere and see the full pages.
 */
export async function restrictedVisitor() {
  return isRestrictedCountry(registrationCountryFromHeaders(await headers()));
}
