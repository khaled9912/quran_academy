"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, requestOtp, verifyOtp } from "@/services/auth.service";
import { ApiError } from "@/lib/backend-client";
import { registrationCountryFromDocument } from "@/lib/registration";
import { reportUnexpectedError } from "@/lib/sentry";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { PhoneInput } from "@/components/ui/phone-input";
import { PasswordField } from "@/components/ui/password-field";
import { DEFAULT_COUNTRY, countryByCode, toE164 } from "@/lib/countries";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Mode = "email" | "phone";

const LoginPage = () => {
  const { applySession } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [needsName, setNeedsName] = useState(false);
  const [phoneName, setPhoneName] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
  };

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      showToast("Please enter your email address.", "error");
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
    if (!trimmedPassword) {
      showToast("Please enter your password.", "error");
      return;
    }

    setLoading(true);
    try {
      const { user } = await signIn(trimmedEmail, trimmedPassword);
      if (!user?.role) {
        showToast("Unable to determine your role. Contact support.", "error");
        return;
      }
      if (user.is_active === false) {
        showToast(
          "Your account is deactivated. Contact an administrator.",
          "error"
        );
        return;
      }
      applySession(user);
    } catch (error) {
      if (!(error instanceof ApiError))
        showToast("Unable to sign in. Please try again.", "error");
      reportUnexpectedError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (phoneLoading) return;
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
      setNeedsName(false);
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

  const handleVerifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (phoneLoading) return;
    if (!/^\d{4,8}$/.test(code.trim())) {
      showToast("Enter the numeric code you received.", "error");
      return;
    }
    if (needsName && !phoneName.trim()) {
      showToast(
        "Enter your full name to finish creating your account.",
        "error"
      );
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
        needsName ? phoneName.trim() : undefined,
        registrationCountryFromDocument() ?? undefined
      );
      if (result.requiresProfile) {
        setNeedsName(true);
        showToast(
          "No account uses this number yet. Enter your full name to create a student account.",
          "info"
        );
        return;
      }
      if (!result.user?.role) {
        showToast("Unable to determine your role. Contact support.", "error");
        return;
      }
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
    setNeedsName(false);
    setCode("");
    setPhoneName("");
    setDevCode(null);
    setSentTo("");
    setPhoneError("");
  };

  const inputClass =
    "w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500";

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center py-24 px-4 font-sans">
      <div className="w-full max-w-md bg-card-bg border border-card-border rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2">Ana Quran</h1>
        <p className="text-center text-foreground opacity-75 mb-6">
          Sign in to manage classes, view your dashboard, or join live lessons.
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
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-green-600 dark:text-green-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordField
                id="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-500 px-4 py-3 text-white font-semibold transition hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <p className="text-center text-xs text-foreground opacity-60">
              Staff and admin accounts sign in with email and password.
            </p>
          </form>
        ) : !codeSent ? (
          <form onSubmit={handleSendCode} className="space-y-5">
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
          <form onSubmit={handleVerifyCode} className="space-y-5">
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

            {needsName && (
              <div>
                <label
                  htmlFor="phone-name"
                  className="block text-sm font-semibold mb-2"
                >
                  Full name
                </label>
                <input
                  id="phone-name"
                  value={phoneName}
                  onChange={(event) => setPhoneName(event.target.value)}
                  required
                  autoComplete="name"
                  className={inputClass}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={phoneLoading}
              className="w-full rounded-xl bg-green-500 px-4 py-3 text-white font-semibold transition hover:bg-green-600 disabled:opacity-50"
            >
              {phoneLoading
                ? "Verifying..."
                : needsName
                  ? "Create account & sign in"
                  : "Verify & sign in"}
            </button>
            <button
              type="button"
              onClick={resetPhoneFlow}
              className="w-full text-center text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"
            >
              Use a different number
            </button>
          </form>
        )}

        <div className="registration-cta mt-8 text-center text-sm text-foreground opacity-75">
          New here?{" "}
          <Link
            href="/signup"
            className="font-semibold text-green-500 dark:text-green-400 hover:underline"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
