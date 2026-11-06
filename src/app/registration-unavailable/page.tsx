import type { Metadata } from "next";
import Link from "next/link";
import { Globe2 } from "lucide-react";

import { REGISTRATION_COUNTRY_LABEL } from "@/lib/registration";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Registration unavailable",
  description:
    "New student registration is currently limited to English-speaking countries. Contact the academy team if you would like to join.",
  path: "/registration-unavailable",
  noIndex: true,
});

const RegistrationUnavailablePage = () => {
  return (
    <div className="min-h-screen bg-background px-4 pb-16 pt-28 text-foreground">
      <div className="mx-auto max-w-2xl rounded-3xl border border-card-border bg-card-bg p-8 text-center sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400">
          <Globe2 size={26} />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-green-500 dark:text-green-400">
          Registration is not available in your region yet
        </h1>
        <p className="mt-4 leading-7 text-foreground opacity-75">
          New student accounts are currently open to students in{" "}
          {REGISTRATION_COUNTRY_LABEL}. We are working on opening more
          countries, and our team can still help you get started.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            Contact the academy
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-card-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-black/5 dark:hover:bg-white/10"
          >
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistrationUnavailablePage;
