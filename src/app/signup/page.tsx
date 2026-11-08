"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { requestOtp, signUp, verifyOtp } from "@/services/auth.service";
import { registrationCountryFromDocument } from "@/lib/registration";
import { ApiError } from "@/lib/backend-client";
import { reportUnexpectedError } from "@/lib/sentry";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { PhoneInput } from "@/components/ui/phone-input";
import { PasswordField } from "@/components/ui/password-field";
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

type Mode = "email" | "phone";

const SignUpPage = () => {
  const { applySession } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>("email");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
  };

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const parsed = signupSchema.safeParse({
      fullName,
      email,
      password,
    });

    if (!parsed.success) {
      showToast(
        parsed.error.issues[0]?.message ?? "Please fix the form.",
        "error"
      );
      return;
    }

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
        registrationCountryFromDocument() ?? undefined
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

  const handleSendCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (phoneLoading) return;
    if (!fullName.trim()) {
      showToast("Please enter your full name.", "error");
      return;
    }
    if (fullName.includes("@")) {
      showToast("Enter your name, not an email address.", "error");
      return;
    }
    const e164 = toE164(phone, country);
    if (!e164) {
      const selected = countryByCode(country);
      const invalidMessage = `Enter a valid mobile number for ${
        selected?.name ?? "the selected country"
      }${selected ? ` (${selected.dial})` : ""}.`;
      setPhoneError(invalidMessage);
      showToast(invalidMessage, "error");
      return;
    }
    setPhoneError("");
    setPhoneLoading(true);
    try {
      const result = await requestOtp(e164);
      setSentTo(e164);
      setCodeSent(true);
      setDevCode(result.devCode ?? null);
      showToast(
        result.devCode
          ? "Development mode: use the code shown below."
          : result.message,
        "info"
      );
    } catch (error) {
      if (!(error instanceof ApiError))
        showToast("Unable to send the code. Please try again.", "error");
      reportUnexpectedError(error);
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (phoneLoading) return;
    if (!/^\d{4,8}$/.test(code.trim())) {
      showToast("Enter the numeric code you received.", "error");
      return;
    }
    if (!sentTo) {
      showToast("Request a new code to continue.", "error");
      return;
    }
    setPhoneLoading(true);
    try {
      const result = await verifyOtp(
        sentTo,
        code.trim(),
        fullName.trim(),
        registrationCountryFromDocument() ?? undefined
      );
      if (!result.user) {
        showToast(
          "We could not create your account. Please try again.",
          "error"
        );
        return;
      }
      // The AuthProvider redirects to the student dashboard once the session is applied.
      applySession(result.user);
    } catch (error) {
      if (!(error instanceof ApiError))
        showToast("Unable to verify the code. Please try again.", "error");
      reportUnexpectedError(error);
    } finally {
      setPhoneLoading(false);
    }
  };

  const resetPhoneFlow = () => {
    setCodeSent(false);
    setCode("");
    setDevCode(null);
    setSentTo("");
    setPhoneError("");
  };

  const inputClass =
    "w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500";

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center py-24 px-4 font-sans">
      <div className="w-full max-w-md bg-card-bg border border-card-border rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2">
          Create your account
        </h1>
        <p className="text-center text-foreground opacity-75 mb-6">
          Sign up with your email or mobile number to start learning with Ana
          Quran.
        </p>

        <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-card-border p-1">
          <button
            type="button"
            onClick={() => switchMode("email")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === "email" ? "bg-green-500 text-white" : "text-foreground hover:bg-green-500/10"}`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => switchMode("phone")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === "phone" ? "bg-green-500 text-white" : "text-foreground hover:bg-green-500/10"}`}
          >
            Mobile number
          </button>
        </div>

        {mode === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
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
                onChange={(event) => setFullName(event.target.value)}
                required
                autoComplete="name"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className={inputClass}
              />
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
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className={inputClass}
              />
              <p className="mt-2 text-xs text-foreground opacity-70">
                At least 8 characters and at least one digit (0-9).
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-500 px-4 py-3 text-white font-semibold transition hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        ) : !codeSent ? (
          <form onSubmit={handleSendCode} className="space-y-5">
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
                onChange={(event) => setFullName(event.target.value)}
                required
                autoComplete="name"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-semibold mb-2"
              >
                Mobile number
              </label>
              <PhoneInput
                id="phone"
                country={country}
                onCountryChange={(next) => {
                  setCountry(next);
                  setPhoneError("");
                }}
                value={phone}
                onChange={(next) => {
                  setPhone(next);
                  setPhoneError("");
                }}
                disabled={phoneLoading}
                error={phoneError}
              />
              <p className="mt-2 text-xs text-foreground opacity-70">
                We will send a one-time code by WhatsApp or SMS.
              </p>
            </div>
            <button
              type="submit"
              disabled={phoneLoading}
              className="w-full rounded-xl bg-green-500 px-4 py-3 text-white font-semibold transition hover:bg-green-600 disabled:opacity-50"
            >
              {phoneLoading ? "Sending code..." : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label
                htmlFor="otp-code"
                className="block text-sm font-semibold mb-2"
              >
                Verification code
              </label>
              <input
                id="otp-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, ""))
                }
                required
                className={`${inputClass} tracking-[0.4em]`}
              />
              <p className="mt-2 text-xs text-foreground opacity-70">
                Sent to {sentTo}.
              </p>
              {devCode && (
                <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                  Development code:{" "}
                  <span className="font-bold tracking-widest">{devCode}</span>
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={phoneLoading}
              className="w-full rounded-xl bg-green-500 px-4 py-3 text-white font-semibold transition hover:bg-green-600 disabled:opacity-50"
            >
              {phoneLoading ? "Creating account..." : "Create account"}
            </button>
            <button
              type="button"
              onClick={resetPhoneFlow}
              className="w-full text-center text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"
            >
              Change my details
            </button>
          </form>
        )}

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
