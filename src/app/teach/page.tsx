import type { Metadata } from "next";
import { TeacherApplicationForm } from "@/components/teacher/TeacherApplicationForm";

export const metadata: Metadata = {
  title: "Teach with Ana Quran | Teacher applications",
  description:
    "Apply to teach Quran, Tajweed, Islamic studies, or Arabic with Ana Quran. Submit your details and CV and our team will review your application.",
};

export default function TeachPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-green-500 dark:text-green-400 mb-3">
            Teach with Ana Quran
          </h1>
          <p className="text-lg text-foreground opacity-75 max-w-2xl mx-auto">
            We are looking for teachers of Quran, Tajweed, Islamic studies, and
            Arabic who want to help students learn one-to-one. Share your
            experience and CV, and optionally a short introduction recording,
            and our team will get back to you.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Apply",
              body: "Submit your details and CV, plus an optional short introduction recording, through the form below.",
            },
            {
              title: "Review",
              body: "Our team reviews every application and may contact you for a short conversation.",
            },
            {
              title: "Onboard",
              body: "Approved teachers receive an invitation to set up their account and availability.",
            },
          ].map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-card-border bg-card-bg p-5"
            >
              <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-500/15 text-sm font-bold text-green-700">
                {index + 1}
              </span>
              <h2 className="font-semibold mb-1">{step.title}</h2>
              <p className="text-sm opacity-70">{step.body}</p>
            </div>
          ))}
        </div>

        <TeacherApplicationForm />
      </div>
    </div>
  );
}
