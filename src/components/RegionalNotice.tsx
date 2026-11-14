import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { ACADEMY_WHATSAPP_URL } from "@/constants/contact";

/**
 * What a visitor from a country the academy does not sell to sees in place of
 * plans and sign-up. Teaching stays open: recruiting there is the reason the
 * gate exists, so the notice points at /teach instead of a dead end.
 */
export function RegionalNotice() {
  return (
    <section className="mx-auto max-w-2xl px-5 pb-24 pt-32 text-center md:px-8 md:pt-40">
      <h1 className="text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[#123c35] dark:text-white md:text-5xl">
        We are not opening new student places in your country right now.
      </h1>
      <p className="mt-6 text-lg leading-8 text-[#5d726a] dark:text-foreground/70">
        Ana Quran Academy teaches English-speaking students worldwide, one
        teacher to one student, in English. Student enrolment is closed where
        you are browsing from, so plans and prices are not published here.
      </p>
      <p className="mt-4 text-lg leading-8 text-[#5d726a] dark:text-foreground/70">
        Want to teach with us instead? Applications from qualified teachers are
        open.
      </p>
      <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/teach"
          className="inline-flex items-center justify-center rounded-2xl bg-[#1d4e47] px-6 py-3.5 text-base font-semibold text-white shadow-[0_12px_22px_rgba(29,78,71,0.18)] transition hover:-translate-y-0.5 hover:bg-[#173f39] dark:bg-green-600 dark:hover:bg-green-500"
        >
          Apply to teach
        </Link>
        <a
          href={ACADEMY_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#cedacd] bg-white/70 px-6 py-3.5 text-base font-semibold text-[#244c40] transition hover:bg-white dark:border-[#3a5a7a] dark:bg-white/10 dark:text-foreground dark:hover:bg-white/15"
        >
          <MessageCircle size={18} />
          Ask us on WhatsApp
        </a>
      </div>
    </section>
  );
}
