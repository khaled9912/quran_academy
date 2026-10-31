"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { CountryCode } from "libphonenumber-js";
import {
  Camera,
  CheckCircle2,
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
  updateProfile,
  uploadAvatar,
  type UpdateProfileInput,
} from "@/services/profile.service";
import { useAuth } from "@/providers/auth-provider";
import type { UserProfile } from "@/types/user";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

const fullNameOf = (user: UserProfile) =>
  user.fullName ?? user.full_name ?? user.first_name ?? "";

const inputClass =
  "w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500";

export default function ProfilePage() {
  const { profile, updateUser } = useAuth();
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
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: ({ user }) => {
      updateUser(user);
      setNotice("Your profile has been updated.");
      setFormError("");
    },
    onError: (error) => {
      setNotice("");
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Unable to save your profile. Please try again."
      );
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: ({ avatarUrl }) => {
      const preview = `${avatarUrl}?v=${Date.now()}`;
      setAvatarPreview(preview);
      if (profile) updateUser({ ...profile, avatarUrl: preview });
      setAvatarError("");
      setNotice("Your profile photo has been updated.");
    },
    onError: (error) => {
      setNotice("");
      setAvatarError(
        error instanceof ApiError
          ? error.message
          : "Unable to upload the image. Please try again."
      );
    },
  });

  const removeAvatarMutation = useMutation({
    mutationFn: deleteAvatar,
    onSuccess: () => {
      setAvatarPreview("");
      if (profile) updateUser({ ...profile, avatarUrl: null });
      setAvatarError("");
      setNotice("Your profile photo has been removed.");
    },
    onError: (error) => {
      setNotice("");
      setAvatarError(
        error instanceof ApiError
          ? error.message
          : "Unable to remove the image. Please try again."
      );
    },
  });

  if (!profile) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-24">
        Please sign in to edit your profile.
      </main>
    );
  }

  const hasStoredEmail = Boolean(profile.email);
  const hasStoredPhone = Boolean(profile.phoneNumber);

  const handleFileChange = (file: File | undefined) => {
    setAvatarError("");
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setAvatarError("Choose a PNG, JPEG, or WebP image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Choose an image under 2 MB.");
      return;
    }
    uploadMutation.mutate(file);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    setFormError("");

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    if (trimmedName.length < 2) {
      setFormError("Enter your full name (at least 2 characters).");
      return;
    }
    if (hasStoredEmail && !trimmedEmail) {
      setFormError("Enter the email address for your account.");
      return;
    }

    const input: UpdateProfileInput = { fullName: trimmedName };
    if (trimmedEmail) input.email = trimmedEmail;

    const typedPhone = phone.trim();
    if (typedPhone || hasStoredPhone) {
      const e164 = toE164(typedPhone, country);
      if (!e164) {
        setFormError("Enter a valid mobile number for the selected country.");
        return;
      }
      input.phoneNumber = e164;
    }

    saveMutation.mutate(input);
  };

  const busy =
    saveMutation.isPending ||
    uploadMutation.isPending ||
    removeAvatarMutation.isPending;

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[.18em] text-green-600">
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
              <span className="mt-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold capitalize text-green-800">
                {profile.role.replace("_", " ")}
              </span>
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-500/10 disabled:opacity-50"
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
              {avatarError && (
                <p role="alert" className="text-sm text-red-600">
                  {avatarError}
                </p>
              )}
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

              {notice && (
                <p
                  role="status"
                  className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                >
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  {notice}
                </p>
              )}
              {formError && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  {formError}
                </p>
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
      </div>
    </div>
  );
}
