import { RESTRICTED_COUNTRIES } from "@/lib/plans";
import { registrationCountryFromDocument } from "@/lib/registration";

export const isRestrictedCountry = (country: string | null) =>
  country !== null && RESTRICTED_COUNTRIES.includes(country);

/**
 * Browser-side read for chrome that cannot see the request header, e.g. the
 * navbar. Reads the cookie the proxy wrote on this visitor's first request.
 */
export function restrictedVisitorInBrowser() {
  return isRestrictedCountry(registrationCountryFromDocument());
}
