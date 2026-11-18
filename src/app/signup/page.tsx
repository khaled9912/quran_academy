"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { signUp } from "@/services/auth.service";
import { registrationCountryFromDocument } from "@/lib/registration";
import { ApiError } from "@/lib/backend-client";
import { reportUnexpectedError } from "@/lib/sentry";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { PhoneInput } from "@/components/ui/phone-input";
import { PasswordField } from "@/components/ui/password-field";
import { FieldError } from "@/components/ui/field-error";
import { DEFAULT_COUNTRY, countryByCode, toE164 } from "@/lib/countries";

const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .refine(
      (value) => !value.includes("@"),
      "Enter your name, not an email address."
    ),
  email: z.string().trim().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Choose a password of at least 8 characters.")
    .regex(/\d/, "Passwords must have at least one digit ('0'-'9')."),
});

const englishRequiredMessage =
  "Please confirm the student can follow a lesson taught in English.";

const invalidPhoneMessage = (countryCode: typeof DEFAULT_COUNTRY) => {
  const selected = countryByCode(countryCode);
  return `Enter a valid mobile number for ${
    selected?.name ?? "the selected country"
  }${selected ? ` (${selected.dial})` : ""}.`;
};

const SignUpPage = () => {
  const { applySession } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) =>
    setFieldErrors((current) =>
      current[field] ? { ...current, [field]: "" } : current
    );

  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [englishConfirmed, setEnglishConfirmed] = useState(false);
  const [englishError, setEnglishError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const parsed = signupSchema.safeParse({ fullName, email, password });
    const invalid: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? "");
        if (field && !invalid[field]) invalid[field] = issue.message;
      }
    }

    const e164 = toE164(phone, country);
    if (!e164) invalid.phone = invalidPhoneMessage(country);

    if (!englishConfirmed) invalid.english = englishRequiredMessage;

    if (Object.keys(invalid).length || !parsed.success || !e164) {
      setFieldErrors(invalid);
      setPhoneError(invalid.phone ?? "");
      setEnglishError(invalid.english ?? "");
      return;
    }
    setFieldErrors({});
    setPhoneError("");
    setEnglishError("");

    const {
      fullName: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
    } = parsed.data;

    setLoading(true);
    try {
      const { user } = await signUp(
        trimmedName,
        trimmedEmail,
        trimmedPassword,
        registrationCountryFromDocument() ?? undefined,
        e164
      );
      if (!user?.role) {
        showToast("Unable to determine your role. Contact support.", "error");
        return;
      }
      // The AuthProvider redirects to the student dashboard once the session is applied.
      applySession(user);
    } catch (error) {
      if (!(error instanceof ApiError))
        showToast("Unable to create your account. Please try again.", "error");
      reportUnexpectedError(error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500";

  const fieldClass = (field: string) =>
    `${inputClass} ${fieldErrors[field] ? "border-red-400" : ""}`;

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center py-24 px-4 font-sans">
      <div className="w-full max-w-md bg-card-bg border border-card-border rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2">
          Create your account
        </h1>
        <p className="text-center text-foreground opacity-75 mb-6">
          Sign up with your email to start learning with Ana Quran.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-semibold mb-2"
            >
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                clearFieldError("fullName");
              }}
              required
              autoComplete="name"
              aria-invalid={fieldErrors.fullName ? true : undefined}
              className={fieldClass("fullName")}
            />
            <FieldError message={fieldErrors.fullName} />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearFieldError("email");
              }}
              required
              autoComplete="email"
              aria-invalid={fieldErrors.email ? true : undefined}
              className={fieldClass("email")}
            />
            <FieldError message={fieldErrors.email} />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold mb-2"
            >
              Password
            </label>
            <PasswordField
              id="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                clearFieldError("password");
              }}
              required
              minLength={8}
              autoComplete="new-password"
              aria-invalid={fieldErrors.password ? true : undefined}
              className={fieldClass("password")}
            />
            <FieldError message={fieldErrors.password} />
            <p className="mt-2 text-xs text-foreground opacity-70">
              At least 8 characters and at least one digit (0-9).
            </p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold mb-2">
              Mobile number
            </label>
            <PhoneInput
              id="phone"
              country={country}
              onCountryChange={(next) => {
                setCountry(next);
                setPhoneError("");
                clearFieldError("phone");
              }}
              value={phone}
              onChange={(next) => {
                setPhone(next);
                setPhoneError("");
                clearFieldError("phone");
              }}
              disabled={loading}
              error={phoneError}
            />
            <p className="mt-2 text-xs text-foreground opacity-70">
              We use this to reach you about your lessons. No code is sent.
            </p>
          </div>

          <div>
            <label
              htmlFor="english-confirmed"
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                englishConfirmed
                  ? "border-green-500 bg-green-500/10"
                  : englishError
                    ? "border-red-400"
                    : "border-card-border"
              }`}
            >
              <input
                id="english-confirmed"
                type="checkbox"
                checked={englishConfirmed}
                onChange={(event) => {
                  setEnglishConfirmed(event.target.checked);
                  setEnglishError("");
                  clearFieldError("english");
                }}
                className="mt-0.5 h-4 w-4 shrink-0 accent-green-600"
              />
              <span className="text-sm">
                Every class is taught in English. I confirm the student can
                follow a lesson in English.{" "}
                <span className="text-red-500 dark:text-red-400">*</span>
              </span>
            </label>
            {englishError && <FieldError message={englishError} />}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-500 px-4 py-3 text-white font-semibold transition hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-foreground opacity-75">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-green-500 dark:text-green-400 hover:underline"
          >
            Sign in
          </Link>
        </div>
        <div className="mt-3 text-center text-sm text-foreground opacity-75">
          Want to teach instead?{" "}
          <Link
            href="/teach"
            className="font-semibold text-green-500 dark:text-green-400 hover:underline"
          >
            Apply as a teacher
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;