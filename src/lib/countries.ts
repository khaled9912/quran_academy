import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

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
