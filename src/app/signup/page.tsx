"use client";

import { useState } from "react";
import Link from "next/link";
import { requestOtp, verifyOtp } from "@/services/auth.service";
import { ApiError } from "@/lib/backend-client";
import { useAuth } from "@/providers/auth-provider";
import { PhoneInput } from "@/components/ui/phone-input";
import { DEFAULT_COUNTRY, countryByCode, toE164 } from "@/lib/countries";

const SignUpPage = () => {
  const { applySession } = useAuth();
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setMessage("");
    if (!fullName.trim()) {
      setMessage("Please enter your full name.");
      return;
    }
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
    setLoading(true);
    try {
      const result = await requestOtp(e164);
      setSentTo(e164);
      setCodeSent(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setMessage("");
    if (!/^\d{4,8}$/.test(code.trim())) {
      setMessage("Enter the numeric code you received.");
      return;
    }
    if (!sentTo) {
      setMessage("Request a new code to continue.");
      return;
    }
    setLoading(true);
    try {
      const result = await verifyOtp(sentTo, code.trim(), fullName.trim());
      if (!result.user) {
        setMessage("We could not create your account. Please try again.");
        return;
      }
      // The AuthProvider redirects to the student dashboard once the session is applied.
      applySession(result.user);
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : "Unable to verify the code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500";

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center py-24 px-4 font-sans">
      <div className="w-full max-w-md bg-card-bg border border-card-border rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2">
          Create your account
        </h1>
        <p className="text-center text-foreground opacity-75 mb-8">
          Sign up with your mobile number. We will send a one-time code by
          WhatsApp or SMS.
        </p>

        {!codeSent ? (
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
                disabled={loading}
                error={phoneError}
              />
              <p className="mt-2 text-xs text-foreground opacity-70">
                Student accounts are created with this number.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-500 px-4 py-3 text-white font-semibold transition hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Sending code..." : "Send code"}
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
                <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
                  Development code:{" "}
                  <span className="font-bold tracking-widest">{devCode}</span>
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-500 px-4 py-3 text-white font-semibold transition hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCodeSent(false);
                setCode("");
                setDevCode(null);
                setSentTo("");
                setPhoneError("");
                setMessage("");
              }}
              className="w-full text-center text-sm font-semibold text-green-600 hover:underline"
            >
              Change my details
            </button>
          </form>
        )}

        {message && (
          <p role="alert" className="mt-4 text-center text-sm text-red-500">
            {message}
          </p>
        )}

        <div className="mt-8 text-center text-sm text-foreground opacity-75">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-green-500 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
