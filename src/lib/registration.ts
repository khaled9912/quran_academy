export const REGISTRATION_COOKIE = "academy-country";

/**
 * Registration is open worldwide. The visitor's country is still captured and
 * sent with the signup so admins can see where a student is writing from, but
 * it no longer decides whether an account can be created.
 */
export function normalizeRegistrationCountry(
  value: string | null | undefined
): string | null {
  const code = value?.trim().toUpperCase() ?? "";
  return /^[A-Z]{2}$/.test(code) && code !== "XX" ? code : null;
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
