"use client";

import type { CountryCode } from "libphonenumber-js";
import { SelectField } from "@/components/ui/select-field";
import {
  countries,
  countryByCode,
  normalizeNational,
  toE164,
} from "@/lib/countries";

interface PhoneInputProps {
  id: string;
  country: CountryCode;
  onCountryChange: (country: CountryCode) => void;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  /** Locks the country: shows the dial code instead of a select. */
  locked?: boolean;
  /** Overrides the default helper text under the field. */
  hintText?: string;
}

export function PhoneInput({
  id,
  country,
  onCountryChange,
  value,
  onChange,
  disabled = false,
  error,
  locked = false,
  hintText,
}: PhoneInputProps) {
  const selected = countryByCode(country);
  const e164 = toE164(value, country);
  const options = countries.map((option) => ({
    value: option.code,
    label: `${option.flag}  ${option.name} (${option.dial})`,
  }));
  const hint = error
    ? error
    : (hintText ??
      (e164
        ? `Code will be sent to ${e164}.`
        : locked
          ? "Enter the number without the country code."
          : "Pick your country, then enter the number without the country code."));

  return (
    <div>
      <div className="flex gap-2">
        {locked ? (
          <div
            aria-label="Country code"
            className="flex w-32 shrink-0 items-center justify-center gap-1 rounded-xl border border-card-border bg-background px-3 text-sm text-foreground opacity-80"
          >
            {selected ? `${selected.flag} ${selected.dial}` : country}
          </div>
        ) : (
          <SelectField
            id={`${id}-country`}
            ariaLabel="Country code"
            className="w-32 shrink-0"
            menuClassName="left-0 w-72 max-w-[82vw]"
            value={country}
            onChange={(next) => onCountryChange(next as CountryCode)}
            options={options}
            searchable
            selectedLabel={
              selected ? `${selected.flag} ${selected.dial}` : undefined
            }
            disabled={disabled}
          />
        )}
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={value}
          onChange={(event) => onChange(normalizeNational(event.target.value))}
          placeholder="Mobile number"
          disabled={disabled}
          className={`w-full min-w-0 flex-1 rounded-xl border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500 ${
            error ? "border-red-400" : "border-card-border"
          }`}
        />
      </div>
      <p
        className={`mt-2 text-xs ${
          error ? "text-red-500" : "text-foreground opacity-70"
        }`}
      >
        {hint}
      </p>
    </div>
  );
}
