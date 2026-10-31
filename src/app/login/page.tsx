"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, requestOtp, verifyOtp } from "@/services/auth.service";
import { ApiError } from "@/lib/backend-client";
import { reportUnexpectedError } from "@/lib/sentry";
import { useAuth } from "@/providers/auth-provider";
import { PhoneInput } from "@/components/ui/phone-input";
import { DEFAULT_COUNTRY, countryByCode, toE164 } from "@/lib/countries";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Mode = "email" | "phone";

const LoginPage = () => {
  const { applySession } = useAuth();
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

  const [message, setMessage] = useState("");

  const switchMode = (next: Mode) => {
    setMode(next);
    setMessage("");
  };

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setMessage("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setMessage("Please enter your email address.");
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setMessage("Please enter a valid email address.");
      return;
    }
    if (!trimmedPassword) {
      setMessage("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const { user } = await signIn(trimmedEmail, trimmedPassword);
      if (!user?.role) {
        setMessage("Unable to determine your role. Contact support.");
        return;
      }
      if (user.is_active === false) {
        setMessage("Your account is deactivated. Contact an administrator.");
        return;
      }
      applySession(user);
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again."
      );
      reportUnexpectedError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (phoneLoading) return;
    setMessage("");
    const e164 = toE164(phone, country);
    if (!e164) {
      const selected = countryByCode(country);
      setPhoneError(
        `Enter a valid mobile number for ${selected?.name ?? "the selected country"}${
          selected ? ` (${selected.dial})` : ""
        }.`
      );
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
      setMessage(
        result.devCode
          ? "Development mode: use the code shown below."
          : result.message
      );
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : "Unable to send the code. Please try again."
      );
      reportUnexpectedError(error);
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (phoneLoading) return;
    setMessage("");
    if (!/^\d{4,8}$/.test(code.trim())) {
      setMessage("Enter the numeric code you received.");
      return;
    }
    if (needsName && !phoneName.trim()) {
      setMessage("Enter your full name to finish creating your account.");
      return;
    }
    if (!sentTo) {
      setMessage("Request a new code to continue.");
      return;
    }
    setPhoneLoading(true);
    try {
      const result = await verifyOtp(
        sentTo,
        code.trim(),
        needsName ? phoneName.trim() : undefined
      );
      if (result.requiresProfile) {
        setNeedsName(true);
        setMessage(
          "No account uses this number yet. Enter your full name to create a student account."
        );
        return;
      }
      if (!result.user?.role) {
        setMessage("Unable to determine your role. Contact support.");
        return;
      }
      applySession(result.user);
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : "Unable to verify the code. Please try again."
      );
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
    setMessage("");
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
                  className="text-xs font-semibold text-green-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
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
                <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
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
              className="w-full text-center text-sm font-semibold text-green-600 hover:underline"
            >
              Use a different number
            </button>
          </form>
        )}

        {message && (
          <p role="alert" className="mt-4 text-center text-sm text-red-500">
            {message}
          </p>
        )}

        <div className="mt-8 text-center text-sm text-foreground opacity-75">
          New here?{" "}
          <Link
            href="/signup"
            className="font-semibold text-green-500 hover:underline"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
