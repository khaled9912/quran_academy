"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset, resetPassword } from "@/services/auth.service";
import { ApiError } from "@/lib/backend-client";
import { reportUnexpectedError } from "@/lib/sentry";
import { useToast } from "@/providers/toast-provider";
import { PasswordField } from "@/components/ui/password-field";
import { FieldError } from "@/components/ui/field-error";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const mismatchMessage = "The new passwords do not match.";

type Step = "request" | "reset" | "done";

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) =>
    setFieldErrors((current) =>
      current[field] ? { ...current, [field]: "" } : current
    );

  const inputClass =
    "w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500";

  const fieldClass = (field: string, message = fieldErrors[field]) =>
    `${inputClass} ${message ? "border-red-400" : ""}`;

  // Derived, so a wrong confirmation is reported while it is still being typed.
  const confirmError =
    fieldErrors.confirmPassword ||
    (confirmPassword && newPassword !== confirmPassword ? mismatchMessage : "");

  const handleRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const address = email.trim();
    if (!emailRegex.test(address)) {
      setFieldErrors({ email: "Please enter a valid email address." });
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const result = await requestPasswordReset(address);
      setEmail(address);
      setDevCode(result.devCode ?? null);
      showToast(result.message, "info");
      setStep("reset");
    } catch (error) {
      if (!(error instanceof ApiError))
        showToast("Unable to send the reset code. Please try again.", "error");
      reportUnexpectedError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const trimmedCode = code.trim();
    const invalid: Record<string, string> = {};
    if (!/^\d{4,8}$/.test(trimmedCode))
      invalid.code = "Enter the numeric code from the email.";
    if (newPassword.length < 8)
      invalid.newPassword = "Choose a new password of at least 8 characters.";
    if (!confirmPassword) invalid.confirmPassword = "Confirm the new password.";
    else if (newPassword !== confirmPassword)
      invalid.confirmPassword = mismatchMessage;

    if (Object.keys(invalid).length) {
      setFieldErrors(invalid);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      await resetPassword(email, trimmedCode, newPassword);
      setStep("done");
    } catch (error) {
      if (!(error instanceof ApiError))
        showToast("Unable to reset your password. Please try again.", "error");
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
              Enter the code we sent to your email.
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
                  onChange={(event) => {
                    setCode(event.target.value.replace(/\D/g, ""));
                    clearFieldError("code");
                  }}
                  required
                  aria-invalid={fieldErrors.code ? true : undefined}
                  className={`${fieldClass("code")} tracking-[0.4em]`}
                />
                <FieldError message={fieldErrors.code} />
                <p className="mt-2 text-xs text-foreground opacity-70">
                  Sent to {email}.
                </p>
                {devCode && (
                  <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                    Development code:{" "}
                    <span className="font-bold tracking-widest">{devCode}</span>
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
                <PasswordField
                  id="new-password"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    clearFieldError("newPassword");
                    clearFieldError("confirmPassword");
                  }}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  aria-invalid={fieldErrors.newPassword ? true : undefined}
                  className={fieldClass("newPassword")}
                />
                <FieldError message={fieldErrors.newPassword} />
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-semibold mb-2"
                >
                  Confirm new password
                </label>
                <PasswordField
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    clearFieldError("confirmPassword");
                  }}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  aria-invalid={confirmError ? true : undefined}
                  className={fieldClass("confirmPassword", confirmError)}
                />
                <FieldError message={confirmError} />
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
                }}
                className="w-full text-center text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"
              >
                Use a different email
              </button>
            </form>
          </>
        )}

        {step === "done" && (
          <div className="space-y-5">
            <p className="rounded-xl border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 p-4 text-center text-sm text-green-800 dark:text-green-300">
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

        {step !== "done" && (
          <div className="mt-8 text-center text-sm text-foreground opacity-75">
            Remembered it?{" "}
            <Link
              href="/login"
              className="font-semibold text-green-500 dark:text-green-400 hover:underline"
            >
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
