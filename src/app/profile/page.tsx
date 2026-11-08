"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import type { CountryCode } from "libphonenumber-js";
import {
  Camera,
  ClipboardList,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  Trash2,
  UserRound,
} from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import { Avatar } from "@/components/ui/avatar";
import { ApiError } from "@/lib/backend-client";
import { DEFAULT_COUNTRY, splitE164, toE164 } from "@/lib/countries";
import {
  deleteAvatar,
  getMyReports,
  updateProfile,
  uploadAvatar,
  type UpdateProfileInput,
} from "@/services/profile.service";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { PasswordField } from "@/components/ui/password-field";
import { changePassword, requestOtp } from "@/services/auth.service";
import {
  lessonDateTime,
  progressClasses,
  progressLabels,
} from "@/lib/lesson-feedback";
import type { UserProfile } from "@/types/user";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const REPORTS_PAGE_SIZE = 3;

const fullNameOf = (user: UserProfile) =>
  user.fullName ?? user.full_name ?? user.first_name ?? "";

const inputClass =
  "w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500";

const profileFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name (at least 2 characters)."),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Please enter a valid email address."
    ),
});

export default function ProfilePage() {
  const { profile, updateUser } = useAuth();
  const { showToast } = useToast();
  const parsedPhone = profile?.phoneNumber
    ? splitE164(profile.phoneNumber)
    : null;

  const [fullName, setFullName] = useState(profile ? fullNameOf(profile) : "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [country, setCountry] = useState<CountryCode>(
    parsedPhone?.country ?? DEFAULT_COUNTRY
  );
  const [phone, setPhone] = useState(parsedPhone?.national ?? "");
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatarUrl ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [stepUpPassword, setStepUpPassword] = useState("");
  const [stepUpCode, setStepUpCode] = useState("");
  const [codeSentTo, setCodeSentTo] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: ({ user }) => {
      updateUser(user);
      showToast("Your profile has been updated.", "success");
      setStepUpPassword("");
      setStepUpCode("");
      setCodeSentTo("");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.status === 403)
          showToast(
            "We couldn't verify your identity. Check the password or code and try again.",
            "error"
          );
        return;
      }
      showToast("Unable to save your profile. Please try again.", "error");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: ({ avatarUrl }) => {
      const preview = `${avatarUrl}?v=${Date.now()}`;
      setAvatarPreview(preview);
      if (profile) updateUser({ ...profile, avatarUrl: preview });
      showToast("Your profile photo has been updated.", "success");
    },
    onError: (error) => {
      if (!(error instanceof ApiError))
        showToast("Unable to upload the image. Please try again.", "error");
    },
  });

  const removeAvatarMutation = useMutation({
    mutationFn: deleteAvatar,
    onSuccess: () => {
      setAvatarPreview("");
      if (profile) updateUser({ ...profile, avatarUrl: null });
      showToast("Your profile photo has been removed.", "success");
    },
    onError: (error) => {
      if (!(error instanceof ApiError))
        showToast("Unable to remove the image. Please try again.", "error");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast(
        "Your password has been changed. Other devices were signed out.",
        "success"
      );
    },
    onError: (error) => {
      if (!(error instanceof ApiError))
        showToast("Unable to change your password. Please try again.", "error");
    },
  });

  const reportsQuery = useInfiniteQuery({
    queryKey: ["profile", "reports"],
    queryFn: ({ pageParam }) => getMyReports(pageParam, REPORTS_PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore
        ? allPages.reduce((count, page) => count + page.items.length, 0)
        : undefined,
    enabled: Boolean(profile),
  });

  const reports = reportsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const isTeacher = profile?.role === "teacher";

  if (!profile) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-24">
        Please sign in to edit your profile.
      </main>
    );
  }

  const hasStoredEmail = Boolean(profile.email);
  const hasStoredPhone = Boolean(profile.phoneNumber);

  // Rebinding a sign-in identifier needs step-up proof, so the API demands a
  // current password or a code to the number already on the account.
  const typedEmail = email.trim().toLowerCase();
  const typedPhoneE164 = phone.trim() ? toE164(phone, country) : null;
  const emailChanged =
    Boolean(typedEmail) &&
    typedEmail !== (profile.email ?? "").trim().toLowerCase();
  const phoneChanged =
    Boolean(typedPhoneE164) && typedPhoneE164 !== (profile.phoneNumber ?? "");
  const needsStepUp = emailChanged || phoneChanged;

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast("Choose a PNG, JPEG, or WebP image.", "error");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      showToast("Choose an image under 2 MB.", "error");
      return;
    }
    uploadMutation.mutate(file);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (hasStoredEmail && !trimmedEmail) {
      showToast("Enter the email address for your account.", "error");
      return;
    }

    const parsed = profileFormSchema.safeParse({
      fullName: trimmedName,
      email: trimmedEmail,
    });

    if (!parsed.success) {
      showToast(
        parsed.error.issues[0]?.message ?? "Please fix the form.",
        "error"
      );
      return;
    }

    const input: UpdateProfileInput = { fullName: parsed.data.fullName };
    if (parsed.data.email) input.email = parsed.data.email;

    const typedPhone = phone.trim();
    if (typedPhone || hasStoredPhone) {
      const e164 = toE164(typedPhone, country);
      if (!e164) {
        showToast(
          "Enter a valid mobile number for the selected country.",
          "error"
        );
        return;
      }
      input.phoneNumber = e164;
    }

    if (needsStepUp) {
      if (!stepUpPassword.trim() && !stepUpCode.trim()) {
        showToast(
          "Confirm your identity with your current password or a code sent to your mobile.",
          "error"
        );
        return;
      }
      if (stepUpPassword.trim()) input.currentPassword = stepUpPassword;
      if (stepUpCode.trim()) input.phoneCode = stepUpCode.trim();
    }

    saveMutation.mutate(input);
  };

  const handleSendStepUpCode = async () => {
    if (!profile.phoneNumber || sendingCode) return;
    setSendingCode(true);
    try {
      await requestOtp(profile.phoneNumber);
      setCodeSentTo(profile.phoneNumber);
    } catch {
      showToast("Unable to send the code. Please try again.", "error");
    } finally {
      setSendingCode(false);
    }
  };

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordMutation.isPending) return;

    if (!currentPassword) {
      showToast("Enter your current password.", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("Choose a new password of at least 8 characters.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("The new passwords do not match.", "error");
      return;
    }
    if (newPassword === currentPassword) {
      showToast("Choose a password different from your current one.", "error");
      return;
    }

    passwordMutation.mutate({ currentPassword, newPassword });
  };

  const busy =
    saveMutation.isPending ||
    uploadMutation.isPending ||
    removeAvatarMutation.isPending;

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[.18em] text-green-600 dark:text-green-400">
            Your account
          </p>
          <h1 className="mt-2 text-4xl font-bold">Profile</h1>
          <p className="mt-2 text-lg text-foreground opacity-75">
            Update how your name, contact details, and photo appear to the
            academy.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <section className="rounded-3xl border border-card-border bg-card-bg p-6">
            <h2 className="text-lg font-semibold">Profile photo</h2>
            <div className="mt-5 flex flex-col items-center text-center">
              <Avatar
                name={fullName}
                src={avatarPreview || null}
                className="h-32 w-32 rounded-3xl text-3xl"
              />
              <p className="mt-4 text-sm font-semibold">{fullName || "—"}</p>
              <span className="mt-1 rounded-full bg-green-100 dark:bg-green-500/15 px-3 py-1 text-xs font-semibold capitalize text-green-800 dark:text-green-300">
                {profile.role.replace("_", " ")}
              </span>
              {isTeacher && (
                <Link
                  href={`/teachers/${profile.id}`}
                  className="mt-3 text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"
                >
                  View public profile & reviews →
                </Link>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_TYPES.join(",")}
                className="hidden"
                onChange={(event) => {
                  handleFileChange(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
              >
                {uploadMutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Camera size={18} />
                )}
                {uploadMutation.isPending ? "Uploading…" : "Upload photo"}
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={() => removeAvatarMutation.mutate()}
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 dark:border-red-500/30 px-4 py-3 font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2 size={18} />
                  {removeAvatarMutation.isPending
                    ? "Removing…"
                    : "Remove photo"}
                </button>
              )}
              <p className="text-xs text-foreground opacity-60">
                PNG, JPEG, or WebP. Up to 2 MB.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
            <h2 className="text-lg font-semibold">Account details</h2>
            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold"
                >
                  Full name
                </label>
                <div className="relative">
                  <UserRound
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground opacity-50"
                  />
                  <input
                    id="fullName"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                    required
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground opacity-50"
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required={hasStoredEmail}
                    placeholder="you@example.com"
                    className={`${inputClass} pl-11`}
                  />
                </div>
                <p className="mt-2 text-xs text-foreground opacity-60">
                  Also used for email sign-in.
                </p>
              </div>

              <div>
                <label
                  htmlFor="profile-phone"
                  className="mb-2 flex items-center gap-2 text-sm font-semibold"
                >
                  <Phone size={16} /> Mobile number
                </label>
                <PhoneInput
                  id="profile-phone"
                  country={country}
                  onCountryChange={setCountry}
                  value={phone}
                  onChange={setPhone}
                  disabled={busy}
                />
                <p className="mt-2 text-xs text-foreground opacity-60">
                  Used for one-time sign-in codes. Changing it requires
                  verification the next time you sign in by phone.
                </p>
              </div>

              {needsStepUp && (
                <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-500/10 p-4">
                  <p className="text-sm font-bold uppercase tracking-[.14em] text-amber-700 dark:text-amber-300">
                    Confirm it's you
                  </p>
                  <p className="mt-1 text-sm text-foreground opacity-75">
                    {emailChanged && phoneChanged
                      ? "You changed both your email and mobile number."
                      : emailChanged
                        ? "You changed your email address."
                        : "You changed your mobile number."}{" "}
                    Verify with your current password, or a code sent to the
                    number already on your account.
                  </p>
                  <label
                    htmlFor="stepup-password"
                    className="mt-3 block text-sm font-semibold"
                  >
                    Current password
                  </label>
                  <PasswordField
                    id="stepup-password"
                    value={stepUpPassword}
                    onChange={(event) => setStepUpPassword(event.target.value)}
                    autoComplete="current-password"
                    className={`${inputClass} mt-2`}
                  />
                  {hasStoredPhone && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => void handleSendStepUpCode()}
                        disabled={sendingCode || busy}
                        className="inline-flex items-center gap-2 rounded-xl border border-card-border px-4 py-2.5 text-sm font-semibold transition hover:border-green-500 disabled:opacity-50"
                      >
                        {sendingCode && (
                          <Loader2 size={16} className="animate-spin" />
                        )}
                        {sendingCode
                          ? "Sending…"
                          : `Send code to ${profile.phoneNumber}`}
                      </button>
                      {codeSentTo && (
                        <>
                          <label
                            htmlFor="stepup-code"
                            className="mt-3 block text-sm font-semibold"
                          >
                            Code sent to {codeSentTo}
                          </label>
                          <input
                            id="stepup-code"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            value={stepUpCode}
                            onChange={(event) =>
                              setStepUpCode(event.target.value)
                            }
                            className={`${inputClass} mt-2`}
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
              >
                {saveMutation.isPending && (
                  <Loader2 size={18} className="animate-spin" />
                )}
                {saveMutation.isPending ? "Saving…" : "Save changes"}
              </button>
            </form>
          </section>
        </div>

        <section className="mt-8 rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <KeyRound
              size={20}
              className="text-green-600 dark:text-green-400"
            />
            Password
          </h2>
          <p className="mt-1 text-sm text-foreground opacity-70">
            Change the password you use to sign in with your email. Accounts
            created with a phone number have no password.
          </p>

          <form
            onSubmit={handlePasswordSubmit}
            className="mt-5 grid gap-5 md:grid-cols-3"
          >
            <div>
              <label
                htmlFor="current-password"
                className="mb-2 block text-sm font-semibold"
              >
                Current password
              </label>
              <PasswordField
                id="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-semibold"
              >
                New password
              </label>
              <PasswordField
                id="new-password"
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
                className="mb-2 block text-sm font-semibold"
              >
                Confirm new password
              </label>
              <PasswordField
                id="confirm-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-3">
              <p className="text-xs text-foreground opacity-60">
                At least 8 characters, including a number and a lowercase
                letter.
              </p>

              <button
                type="submit"
                disabled={passwordMutation.isPending}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
              >
                {passwordMutation.isPending && (
                  <Loader2 size={18} className="animate-spin" />
                )}
                {passwordMutation.isPending ? "Updating…" : "Change password"}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8 rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ClipboardList
              size={20}
              className="text-green-600 dark:text-green-400"
            />
            {isTeacher ? "Reports you submitted" : "Class reports"}
          </h2>
          <p className="mt-1 text-sm text-foreground opacity-70">
            {isTeacher
              ? "Each finished lesson needs a class summary and feedback about the student."
              : "Your teacher's summary and feedback from each completed lesson."}
          </p>

          {reportsQuery.isLoading ? (
            <p className="mt-5 text-sm text-foreground opacity-70">
              Loading reports…
            </p>
          ) : reportsQuery.error ? (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
            >
              {reportsQuery.error instanceof Error
                ? reportsQuery.error.message
                : "Unable to load your reports."}
            </p>
          ) : reports.length ? (
            <div className="mt-5 space-y-4">
              {reports.map((report) => (
                <article
                  key={report.id}
                  className="rounded-2xl border border-card-border p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">
                      {lessonDateTime(report.startsAt)}
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${progressClasses[report.progress]}`}
                    >
                      {progressLabels[report.progress]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-foreground opacity-65">
                    {isTeacher
                      ? `Student: ${report.studentName}`
                      : `Teacher: ${report.teacherName}`}
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.14em] text-foreground opacity-60">
                        Class summary
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm">
                        {report.classSummary}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.14em] text-foreground opacity-60">
                        Feedback
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm">
                        {report.studentFeedback}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/lesson/${report.lessonId}`}
                    className="mt-3 inline-block text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"
                  >
                    Open lesson →
                  </Link>
                </article>
              ))}
              {reportsQuery.hasNextPage && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => void reportsQuery.fetchNextPage()}
                    disabled={reportsQuery.isFetchingNextPage}
                    className="inline-flex items-center gap-2 rounded-xl border border-card-border px-5 py-2.5 text-sm font-semibold transition hover:border-green-500 disabled:opacity-50"
                  >
                    {reportsQuery.isFetchingNextPage && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    {reportsQuery.isFetchingNextPage
                      ? "Loading…"
                      : `Load ${REPORTS_PAGE_SIZE} more reports`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-5 rounded-2xl border border-dashed border-card-border p-6 text-center text-sm text-foreground opacity-70">
              No reports yet.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
