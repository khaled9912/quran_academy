"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset, resetPassword } from "@/services/auth.service";
import { ApiError } from "@/lib/backend-client";
import { reportUnexpectedError } from "@/lib/sentry";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = "request" | "reset" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const inputClass =
    "w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500";

  const handleRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setError("");
    setMessage("");

    const address = email.trim();
    if (!emailRegex.test(address)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const result = await requestPasswordReset(address);
      setEmail(address);
      setDevCode(result.devCode ?? null);
      setMessage(result.message);
      setStep("reset");
    } catch (error) {
      setError(
        error instanceof ApiError
          ? error.message
          : "Unable to send the reset code. Please try again."
      );
      reportUnexpectedError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setError("");

    const trimmedCode = code.trim();
    if (!/^\d{4,8}$/.test(trimmedCode)) {
      setError("Enter the numeric code from the email.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Choose a new password of at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, trimmedCode, newPassword);
      setMessage("");
      setError("");
      setStep("done");
    } catch (error) {
      setError(
        error instanceof ApiError
          ? error.message
          : "Unable to reset your password. Please try again."
      );
      reportUnexpectedError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center py-24 px-4 font-sans">
      <div className="w-full max-w-md bg-card-bg border border-card-border rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2">
          Reset your password
        </h1>

        {step === "request" && (
          <>
            <p className="text-center text-foreground opacity-75 mb-6">
              Enter the email address you use to sign in. We will send a
              one-time code to reset your password.
            </p>
            <form onSubmit={handleRequest} className="space-y-5">
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
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-green-500 px-4 py-3 text-white font-semibold transition hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? "Sending code..." : "Send reset code"}
              </button>
            </form>
          </>
        )}

        {step === "reset" && (
          <>
            <p className="text-center text-foreground opacity-75 mb-6">
              {message || "Enter the code we sent to your email."}
            </p>
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label
                  htmlFor="reset-code"
                  className="block text-sm font-semibold mb-2"
                >
                  Verification code
                </label>
                <input
                  id="reset-code"
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
                  Sent to {email}.
                </p>
                {devCode && (
                  <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
                    Development code:{" "}
                    <span className="font-bold tracking-widest">
                      {devCode}
                    </span>
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-semibold mb-2"
                >
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-semibold mb-2"
                >
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-green-500 px-4 py-3 text-white font-semibold transition hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("request");
                  setCode("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setDevCode(null);
                  setError("");
                  setMessage("");
                }}
                className="w-full text-center text-sm font-semibold text-green-600 hover:underline"
              >
                Use a different email
              </button>
            </form>
          </>
        )}

        {step === "done" && (
          <div className="space-y-5">
            <p className="rounded-xl border border-green-200 bg-green-50 p-4 text-center text-sm text-green-800">
              Your password has been reset. Sign in with your new password.
            </p>
            <Link
              href="/login"
              className="block w-full rounded-xl bg-green-500 px-4 py-3 text-center font-semibold text-white transition hover:bg-green-600"
            >
              Back to sign in
            </Link>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 text-center text-sm text-red-500">
            {error}
          </p>
        )}

        {step !== "done" && (
          <div className="mt-8 text-center text-sm text-foreground opacity-75">
            Remembered it?{" "}
            <Link
              href="/login"
              className="font-semibold text-green-500 hover:underline"
            >
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
