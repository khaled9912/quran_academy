import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/min";

export interface CountryOption {
  code: CountryCode;
  name: string;
  dial: string;
  flag: string;
}

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
})();

const toFlag = (code: string) =>
  code.replace(/./g, (char) =>
    String.fromCodePoint(127397 + char.charCodeAt(0))
  );

export const countries: CountryOption[] = getCountries()
  .map((code) => ({
    code,
    name: regionNames?.of(code) ?? code,
    dial: `+${getCountryCallingCode(code)}`,
    flag: toFlag(code),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const byCode = new Map(countries.map((country) => [country.code, country]));

export const countryByCode = (code: CountryCode) => byCode.get(code);

export const DEFAULT_COUNTRY: CountryCode = "LB";

/** The 22 Arab League members, used where the academy hires from the region. */
export const ARAB_COUNTRY_CODES: CountryCode[] = [
  "DZ", // Algeria
  "BH", // Bahrain
  "KM", // Comoros
  "DJ", // Djibouti
  "EG", // Egypt
  "IQ", // Iraq
  "JO", // Jordan
  "KW", // Kuwait
  "LB", // Lebanon
  "LY", // Libya
  "MR", // Mauritania
  "MA", // Morocco
  "OM", // Oman
  "PS", // Palestine
  "QA", // Qatar
  "SA", // Saudi Arabia
  "SD", // Sudan
  "SO", // Somalia
  "SY", // Syria
  "TN", // Tunisia
  "AE", // United Arab Emirates
  "YE", // Yemen
];

export const normalizeNational = (value: string) =>
  value.replace(/[^\d\s()-]/g, "");

export const nationalDigits = (value: string) => value.replace(/\D/g, "");

export const isValidNumberFor = (national: string, country: CountryCode) => {
  const digits = nationalDigits(national);
  return digits.length > 0 && isValidPhoneNumber(digits, country);
};

export const toE164 = (national: string, country: CountryCode) => {
  if (!isValidNumberFor(national, country)) return null;
  return (
    parsePhoneNumberFromString(nationalDigits(national), country)?.number ??
    null
  );
};

/** Splits a stored E.164 number back into the PhoneInput country + national parts. */
export const splitE164 = (value: string) => {
  const parsed = parsePhoneNumberFromString(value);
  if (!parsed?.country) return null;
  return { country: parsed.country, national: parsed.nationalNumber };
};
