"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Loader2,
  Mic,
  Upload,
  X,
} from "lucide-react";
import type { CountryCode } from "libphonenumber-js";
import { ARAB_COUNTRY_CODES, toE164 } from "@/lib/countries";
import { teacherSubjects, type TeacherSubject } from "@/lib/teacher-subjects";
import {
  englishLevelLabel,
  englishLevels,
  type EnglishLevel,
} from "@/types/teacher-application";
import { PhoneInput } from "@/components/ui/phone-input";
import { submitTeacherApplication } from "@/services/teacher-application.service";
import { ApiError } from "@/lib/backend-client";

const MAX_CV_BYTES = 2 * 1024 * 1024;
const MAX_INTRO_BYTES = 20 * 1024 * 1024;
const INTRO_PATTERN = /\.(mp3|m4a|wav|ogg|webm|mp4|mov)$/i;
const inputClass =
  "w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500";

// Applicants pick their dial code, but the list is the Arab world and Egypt is
// the default because that is where most teachers are.
const DEFAULT_APPLICANT_COUNTRY: CountryCode = "EG";

type Status = "idle" | "submitting" | "success";

export function TeacherApplicationForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>(
    DEFAULT_APPLICANT_COUNTRY
  );
  const [subjects, setSubjects] = useState<TeacherSubject[]>([]);
  const [englishLevel, setEnglishLevel] = useState<EnglishLevel | "">("");
  const [experienceYears, setExperienceYears] = useState("");
  const [bio, setBio] = useState("");
  const [availabilityNote, setAvailabilityNote] = useState("");
  const [cv, setCv] = useState<File | null>(null);
  const [intro, setIntro] = useState<File | null>(null);
  const [quran, setQuran] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [reference, setReference] = useState("");

  const toggleSubject = (subject: TeacherSubject) => {
    setSubjects((current) =>
      current.includes(subject)
        ? current.filter((item) => item !== subject)
        : [...current, subject]
    );
    setErrors((current) => {
      const next = { ...current };
      delete next.subjects;
      return next;
    });
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;
    if (!/\.(pdf|doc|docx)$/i.test(file.name)) {
      setErrors((current) => ({
        ...current,
        cv: "Upload your CV as a PDF, DOC, or DOCX file.",
      }));
      setCv(null);
      return;
    }
    if (file.size > MAX_CV_BYTES) {
      setErrors((current) => ({
        ...current,
        cv: "The CV must be 2 MB or smaller.",
      }));
      setCv(null);
      return;
    }
    setErrors((current) => {
      const next = { ...current };
      delete next.cv;
      return next;
    });
    setCv(file);
  };

  const onRecordingChange =
    (field: "intro" | "quran", setFile: (file: File | null) => void) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      event.target.value = "";
      if (!file) return;
      if (!INTRO_PATTERN.test(file.name)) {
        setErrors((current) => ({
          ...current,
          [field]:
            "Upload your recording as MP3, M4A, WAV, OGG, WebM, MP4, or MOV.",
        }));
        setFile(null);
        return;
      }
      if (file.size > MAX_INTRO_BYTES) {
        setErrors((current) => ({
          ...current,
          [field]: "The recording must be 20 MB or smaller.",
        }));
        setFile(null);
        return;
      }
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
      setFile(file);
    };

  const validate = () => {
    const next: Record<string, string> = {};
    if (fullName.trim().length < 2 || fullName.trim().length > 160)
      next.fullName = "Enter your full name (2 to 160 characters).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = "Enter a valid email address.";
    if (!toE164(phone, phoneCountry))
      next.phoneNumber = "Enter a valid mobile number.";
    if (subjects.length === 0)
      next.subjects = "Choose at least one subject you teach.";
    if (!englishLevel) next.englishLevel = "Choose your English level.";
    const years = Number(experienceYears);
    if (
      experienceYears.trim() === "" ||
      !Number.isInteger(years) ||
      years < 0 ||
      years > 70
    )
      next.experienceYears =
        "Enter your years of teaching experience (0 to 70).";
    if (bio.trim().length < 20)
      next.bio = "Write a short introduction (at least 20 characters).";
    if (availabilityNote.trim().length > 500)
      next.availabilityNote =
        "Keep the availability note under 500 characters.";
    if (!cv) next.cv = "Attach your CV (PDF, DOC, or DOCX, up to 2 MB).";
    if (!quran)
      next.quran =
        "Attach a Quran recitation (MP3, M4A, WAV, OGG, WebM, MP4, or MOV, up to 20 MB).";
    return next;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitError("");
      return;
    }

    setStatus("submitting");
    setSubmitError("");
    setErrors({});
    try {
      const result = await submitTeacherApplication({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: toE164(phone, phoneCountry)!,
        subjects,
        englishLevel: englishLevel as EnglishLevel,
        experienceYears: Number(experienceYears),
        bio: bio.trim(),
        availabilityNote: availabilityNote.trim(),
        cv: cv!,
        intro: intro ?? undefined,
        quran: quran!,
      });
      setReference(result.id);
      setStatus("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setStatus("idle");
      if (error instanceof ApiError && error.validationErrors) {
        const mapped: Record<string, string> = {};
        Object.entries(error.validationErrors).forEach(([field, messages]) => {
          if (messages[0]) mapped[field] = messages[0];
        });
        setErrors(mapped);
        setSubmitError("Please fix the highlighted fields and try again.");
      } else if (!(error instanceof ApiError)) {
        setSubmitError("Unable to submit your application. Please try again.");
      }
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600 dark:text-green-400" />
        <h2 className="text-2xl font-semibold mb-2">Application received</h2>
        <p className="text-foreground opacity-80 mb-4">
          Thank you, {fullName.trim()}. Our team will review your CV and contact
          you at {email.trim()} if your profile matches our current needs.
        </p>
        <p className="text-sm text-foreground opacity-60">
          Reference: <span className="font-mono">{reference}</span>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-3xl border border-card-border bg-card-bg p-6 sm:p-8"
    >
      {submitError && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400"
        >
          {submitError}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="fullName"
            className="mb-2 block text-sm font-semibold"
          >
            Full name <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            id="fullName"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
            className={`${inputClass} ${
              errors.fullName ? "border-red-400" : ""
            }`}
          />
          {errors.fullName && (
            <p className="mt-2 text-xs text-red-500 dark:text-red-400">
              {errors.fullName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold">
            Email <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className={`${inputClass} ${errors.email ? "border-red-400" : ""}`}
          />
          {errors.email && (
            <p className="mt-2 text-xs text-red-500 dark:text-red-400">
              {errors.email}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="phone" className="mb-2 block text-sm font-semibold">
            Mobile number{" "}
            <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <PhoneInput
            id="phone"
            country={phoneCountry}
            onCountryChange={setPhoneCountry}
            only={ARAB_COUNTRY_CODES}
            value={phone}
            onChange={setPhone}
            error={errors.phoneNumber}
          />
        </div>

        <div className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold">
            Subjects you teach{" "}
            <span className="text-red-500 dark:text-red-400">*</span>
          </span>
          <div className="grid gap-3 sm:grid-cols-2">
            {teacherSubjects.map((subject) => {
              const checked = subjects.includes(subject.value);
              return (
                <label
                  key={subject.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                    checked
                      ? "border-green-500 bg-green-500/10 font-semibold"
                      : "border-card-border"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSubject(subject.value)}
                    className="h-4 w-4 accent-green-600"
                  />
                  <span>{subject.label}</span>
                </label>
              );
            })}
          </div>
          {errors.subjects && (
            <p className="mt-2 text-xs text-red-500 dark:text-red-400">
              {errors.subjects}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold">
            English level{" "}
            <span className="text-red-500 dark:text-red-400">*</span>
          </span>
          <div className="grid gap-3 sm:grid-cols-2">
            {englishLevels.map((level) => {
              const checked = englishLevel === level;
              return (
                <label
                  key={level}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                    checked
                      ? "border-green-500 bg-green-500/10 font-semibold"
                      : "border-card-border"
                  }`}
                >
                  <input
                    type="radio"
                    name="englishLevel"
                    checked={checked}
                    onChange={() => {
                      setEnglishLevel(level);
                      setErrors((current) => {
                        const next = { ...current };
                        delete next.englishLevel;
                        return next;
                      });
                    }}
                    className="h-4 w-4 accent-green-600"
                  />
                  <span>{englishLevelLabel[level]}</span>
                </label>
              );
            })}
          </div>
          {errors.englishLevel && (
            <p className="mt-2 text-xs text-red-500 dark:text-red-400">
              {errors.englishLevel}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="experienceYears"
            className="mb-2 block text-sm font-semibold"
          >
            Years of teaching experience{" "}
            <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            id="experienceYears"
            type="number"
            min={0}
            max={70}
            inputMode="numeric"
            value={experienceYears}
            onChange={(event) => setExperienceYears(event.target.value)}
            className={`${inputClass} ${
              errors.experienceYears ? "border-red-400" : ""
            }`}
          />
          {errors.experienceYears && (
            <p className="mt-2 text-xs text-red-500 dark:text-red-400">
              {errors.experienceYears}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="availabilityNote"
            className="mb-2 block text-sm font-semibold"
          >
            Weekly availability <span className="opacity-60">(optional)</span>
          </label>
          <input
            id="availabilityNote"
            value={availabilityNote}
            onChange={(event) => setAvailabilityNote(event.target.value)}
            maxLength={500}
            placeholder="e.g. Weekdays after 6pm, Saturday mornings"
            className={`${inputClass} ${
              errors.availabilityNote ? "border-red-400" : ""
            }`}
          />
          {errors.availabilityNote && (
            <p className="mt-2 text-xs text-red-500 dark:text-red-400">
              {errors.availabilityNote}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="bio" className="mb-2 block text-sm font-semibold">
            About you <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <textarea
            id="bio"
            rows={5}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={2000}
            placeholder="Tell us about your qualifications, teaching style, and the students you have worked with."
            className={`${inputClass} resize-y ${
              errors.bio ? "border-red-400" : ""
            }`}
          />
          <div className="mt-2 flex items-center justify-between text-xs opacity-70">
            <span>
              {errors.bio ? (
                <span className="text-red-500 dark:text-red-400">
                  {errors.bio}
                </span>
              ) : (
                "20 to 2000 characters."
              )}
            </span>
            <span>{bio.length}/2000</span>
          </div>
        </div>

        <div className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold">
            CV <span className="text-red-500 dark:text-red-400">*</span>
          </span>
          {cv ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-green-500/40 bg-green-500/5 px-4 py-3">
              <span className="flex min-w-0 items-center gap-2 text-sm">
                <FileText
                  size={18}
                  className="shrink-0 text-green-600 dark:text-green-400"
                />
                <span className="truncate">{cv.name}</span>
                <span className="shrink-0 opacity-60">
                  {(cv.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </span>
              <button
                type="button"
                onClick={() => setCv(null)}
                aria-label="Remove CV"
                className="rounded-lg p-1.5 text-foreground opacity-70 transition hover:bg-red-500/10 hover:text-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label
              htmlFor="cv"
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center text-sm transition hover:border-green-500 ${
                errors.cv ? "border-red-400" : "border-card-border"
              }`}
            >
              <Upload size={20} className="opacity-60" />
              <span className="font-semibold">Upload your CV</span>
              <span className="opacity-60">PDF, DOC, or DOCX · up to 2 MB</span>
              <input
                id="cv"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={onFileChange}
                className="sr-only"
              />
            </label>
          )}
          {errors.cv && (
            <p className="mt-2 text-xs text-red-500 dark:text-red-400">
              {errors.cv}
            </p>
          )}
          <p className="mt-2 text-xs opacity-60">
            Your CV is only visible to academy administrators.
          </p>
        </div>

        <div className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold">
            Self-introduction recording{" "}
            <span className="opacity-60">(optional)</span>
          </span>
          {intro ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-green-500/40 bg-green-500/5 px-4 py-3">
              <span className="flex min-w-0 items-center gap-2 text-sm">
                <Mic
                  size={18}
                  className="shrink-0 text-green-600 dark:text-green-400"
                />
                <span className="truncate">{intro.name}</span>
                <span className="shrink-0 opacity-60">
                  {(intro.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </span>
              <button
                type="button"
                onClick={() => setIntro(null)}
                aria-label="Remove recording"
                className="rounded-lg p-1.5 text-foreground opacity-70 transition hover:bg-red-500/10 hover:text-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label
              htmlFor="intro"
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center text-sm transition hover:border-green-500 ${
                errors.intro ? "border-red-400" : "border-card-border"
              }`}
            >
              <Mic size={20} className="opacity-60" />
              <span className="font-semibold">Upload a short introduction</span>
              <span className="opacity-60">
                MP3, M4A, WAV, OGG, WebM, MP4, or MOV · up to 20 MB
              </span>
              <input
                id="intro"
                type="file"
                accept=".mp3,.m4a,.wav,.ogg,.webm,.mp4,.mov,audio/*,video/*"
                onChange={onRecordingChange("intro", setIntro)}
                className="sr-only"
              />
            </label>
          )}
          {errors.intro && (
            <p className="mt-2 text-xs text-red-500 dark:text-red-400">
              {errors.intro}
            </p>
          )}
          <p className="mt-2 text-xs opacity-60">
            Optional: record a 1–2 minute voice note on your phone introducing
            yourself, then upload it here. Only academy administrators can
            access it.
          </p>
        </div>

        <div className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold">
            Quran recitation{" "}
            <span className="text-red-500 dark:text-red-400">*</span>
          </span>
          {quran ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-green-500/40 bg-green-500/5 px-4 py-3">
              <span className="flex min-w-0 items-center gap-2 text-sm">
                <BookOpen
                  size={18}
                  className="shrink-0 text-green-600 dark:text-green-400"
                />
                <span className="truncate">{quran.name}</span>
                <span className="shrink-0 opacity-60">
                  {(quran.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </span>
              <button
                type="button"
                onClick={() => setQuran(null)}
                aria-label="Remove Quran recording"
                className="rounded-lg p-1.5 text-foreground opacity-70 transition hover:bg-red-500/10 hover:text-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label
              htmlFor="quran"
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center text-sm transition hover:border-green-500 ${
                errors.quran ? "border-red-400" : "border-card-border"
              }`}
            >
              <BookOpen size={20} className="opacity-60" />
              <span className="font-semibold">Upload a Quran recitation</span>
              <span className="opacity-60">
                Recite first page from surat Mariam· MP3, M4A, WAV, OGG, WebM,
                MP4, or MOV · up to 20 MB
              </span>
              <input
                id="quran"
                type="file"
                accept=".mp3,.m4a,.wav,.ogg,.webm,.mp4,.mov,audio/*,video/*"
                onChange={onRecordingChange("quran", setQuran)}
                className="sr-only"
              />
            </label>
          )}
          {errors.quran && (
            <p className="mt-2 text-xs text-red-500 dark:text-red-400">
              {errors.quran}
            </p>
          )}
          <p className="mt-2 text-xs opacity-60">
            Required: record 1–2 minutes of your Quran recitation and upload it
            here. Only academy administrators can access it.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Submitting…
          </>
        ) : (
          "Submit application"
        )}
      </button>
      <p className="mt-3 text-center text-xs opacity-60">
        We review every application manually. You will hear from us by email.
      </p>
    </form>
  );
}
