export const REGISTRATION_COUNTRIES = [
  "US",
  "GB",
  "CA",
  "AU",
  "NZ",
  "IE",
] as const;

export const REGISTRATION_COUNTRY_LABEL =
  "United States, United Kingdom, Canada, Australia, New Zealand, and Ireland";

export const REGISTRATION_BLOCKED_MESSAGE = `Registration is currently available only to students in ${REGISTRATION_COUNTRY_LABEL}.`;

export const REGISTRATION_COOKIE = "academy-country";

export function normalizeRegistrationCountry(
  value: string | null | undefined
): string | null {
  const code = value?.trim().toUpperCase() ?? "";
  return /^[A-Z]{2}$/.test(code) && code !== "XX" ? code : null;
}

export function isRegistrationCountry(
  value: string | null | undefined
): value is (typeof REGISTRATION_COUNTRIES)[number] {
  const code = normalizeRegistrationCountry(value);
  return (
    code !== null &&
    (REGISTRATION_COUNTRIES as readonly string[]).includes(code)
  );
}

/** Unknown country fails open so local and self-hosted previews stay usable. */
export function isRegistrationAllowed(
  value: string | null | undefined
): boolean {
  const code = normalizeRegistrationCountry(value);
  return code === null || isRegistrationCountry(code);
}

/** Reads the country supplied by Vercel, Netlify, or Cloudflare. */
export function registrationCountryFromHeaders(
  headers: Headers
): string | null {
  const direct =
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    headers.get("x-country");
  const normalized = normalizeRegistrationCountry(direct);
  if (normalized) return normalized;

  const netlify = headers.get("x-nf-geo");
  if (netlify) {
    try {
      const decoded = JSON.parse(atob(netlify)) as {
        country?: { code?: string } | string;
      };
      const code =
        typeof decoded.country === "string"
          ? decoded.country
          : decoded.country?.code;
      return normalizeRegistrationCountry(code);
    } catch {
      return null;
    }
  }

  return null;
}

export function registrationCountryFromCookie(
  cookieHeader: string | null | undefined
): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)academy-country=([A-Za-z]{2})/);
  return normalizeRegistrationCountry(match?.[1]);
}

/** Browser-side read of the cookie set by middleware on the first request. */
export function registrationCountryFromDocument(): string | null {
  if (typeof document === "undefined") return null;
  return registrationCountryFromCookie(document.cookie);
}
