import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Globe2,
  Languages,
  UserCheck,
  Users,
} from "lucide-react";

import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import {
  absoluteUrl,
  pageMetadata,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import {
  LESSON_MINUTES,
  perClassUsd,
  plans,
  PRICING_HIDDEN_COUNTRIES,
  usd,
  type Plan,
} from "@/lib/plans";
import { registrationCountryFromHeaders } from "@/lib/registration";

/**
 * Prices are hidden from the countries where the academy recruits its teachers.
 * The geo header comes from the hosting provider, so this is a deterrent rather
 * than a control: a VPN or a rewritten cookie gets around it.
 */
async function pricingHidden() {
  const country = registrationCountryFromHeaders(await headers());
  return country !== null && PRICING_HIDDEN_COUNTRIES.includes(country);
}

const inclusions = [
  {
    icon: Users,
    title: "One teacher, one student",
    body: "Never a group. Your lesson time belongs to you alone.",
  },
  {
    icon: UserCheck,
    title: "The same teacher every week",
    body: "We match you with one teacher and they stay with you.",
  },
  {
    icon: Languages,
    title: "Taught in English",
    body: "Explain questions in English, not only in Arabic.",
  },
  {
    icon: Clock,
    title: `${LESSON_MINUTES}-minute lessons`,
    body: "Every plan below is built from classes of this length.",
  },
  {
    icon: Globe2,
    title: "Your time zone",
    body: "Weekly times show in your local time, wherever you live.",
  },
  {
    icon: FileText,
    title: "A report after every lesson",
    body: "Written progress you can read, not a vague update.",
  },
];

const faqs = [
  {
    question: "How long is each class?",
    answer:
      "Every plan on this page is a series of 30-minute classes. If your family needs 45 or 60 minutes, say so when you book your free lesson and we will arrange it with your teacher.",
  },
  {
    question: "When do I pay?",
    answer:
      "After the month, not before it. You are billed only for lessons that actually took place, and you can see each one in your account before you pay.",
  },
  {
    question: "How do I pay?",
    answer:
      "By bank transfer in US dollars. You copy the academy's account details from your payments page and send the month's total.",
  },
  {
    question: "Can I cancel a lesson?",
    answer:
      "Yes, free of charge up to 24 hours before it starts. Inside 24 hours the lesson is still counted, because your teacher has already set the time aside for you. Once a month, a late cancellation is excused.",
  },
  {
    question: "What if my teacher cancels?",
    answer:
      "You lose nothing. The lesson is credited back to you and you can book a make-up time.",
  },
  {
    question: "Can I change or stop my plan?",
    answer:
      "Yes. There is no contract term. You can change your weekly days or end your plan from your account.",
  },
  {
    question: "Is the first lesson really free?",
    answer:
      "Yes. Your very first lesson costs nothing and carries no obligation to continue. It is how you judge the teacher before you commit to a monthly plan.",
  },
  {
    question: "Are there any other fees?",
    answer:
      "No sign-up fee and no charge for materials. The monthly plan price is the whole cost, apart from lessons cancelled inside 24 hours as described above.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const hidden = await pricingHidden();

  return pageMetadata({
    title: hidden
      ? "Plans and Weekly Schedules"
      : "Online Quran Class Plans and Prices",
    description: hidden
      ? "One-to-one online Quran classes in English, 30 minutes each, from two to five days a week. Your monthly fee is confirmed after your free first lesson."
      : "Online Quran class plans from $38 a month: one-to-one lessons in English, 30 minutes each, two to five days a week. Pay after the month, and start with a free first lesson.",
    path: "/plans",
    keywords: hidden
      ? ["online Quran classes", "one-to-one Quran lessons"]
      : [
          "online Quran classes price",
          "online Quran class cost",
          "Quran classes per month",
          "online Quran lessons price",
          "affordable online Quran classes",
          "1 to 1 Quran class price",
        ],
  });
}

const priceLine = (plan: Plan) => `${usd(plan.priceUsd)} per month`;

export default async function PlansPage() {
  const hidden = await pricingHidden();
  const url = absoluteUrl("/plans");

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Plans", item: url },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  // Prices are deliberately absent from structured data when the visitor's
  // country is gated, so the figures do not surface through search results.
  const planSchemas = hidden
    ? undefined
    : {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: plans.map((plan, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Offer",
            name: `${plan.daysPerWeek} days a week`,
            description: `${plan.classesPerMonth} one-to-one ${LESSON_MINUTES}-minute Quran classes per month.`,
            price: plan.priceUsd.toFixed(2),
            priceCurrency: "USD",
            url,
            availability: "https://schema.org/InStock",
          },
        })),
      };

  return (
    <main className="overflow-hidden bg-[#f3efe8] text-[#173b35] dark:bg-background dark:text-foreground">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      {planSchemas && <JsonLd data={planSchemas} />}

      <section className="relative isolate border-b border-[#e2e8dc] dark:border-card-border">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_10%,rgba(206,224,197,0.42),transparent_32%),linear-gradient(135deg,#f3efe8_0%,#eef3e9_100%)] dark:bg-[radial-gradient(circle_at_85%_10%,rgba(124,167,130,0.18),transparent_32%),linear-gradient(135deg,#162f45_0%,#1a3a52_100%)]" />
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-28 md:px-8 md:pb-20 md:pt-36">
          <nav
            aria-label="Breadcrumb"
            className="text-sm text-[#7a8a80] dark:text-foreground/50"
          >
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#1d5145] dark:hover:text-green-400"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li
                aria-current="page"
                className="text-[#4f675c] dark:text-foreground/70"
              >
                Plans
              </li>
            </ol>
          </nav>

          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[#123c35] dark:text-white sm:text-5xl md:text-6xl">
            One teacher. One student. One weekly time.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5d726a] dark:text-foreground/70">
            Choose how many days a week you want to learn. Every plan is a set
            of {LESSON_MINUTES}-minute one-to-one classes, taught in English,
            with the same teacher each week. Your first class is free.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1d4e47] px-6 py-3.5 text-base font-semibold text-white shadow-[0_12px_22px_rgba(29,78,71,0.18)] transition hover:-translate-y-0.5 hover:bg-[#173f39] dark:bg-green-600 dark:hover:bg-green-500"
            >
              Start with a free lesson <ArrowRight size={18} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-2xl border border-[#cedacd] bg-white/70 px-6 py-3.5 text-base font-semibold text-[#244c40] transition hover:bg-white dark:border-[#3a5a7a] dark:bg-white/10 dark:text-foreground dark:hover:bg-white/15"
            >
              Ask a question first
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <h2 className="text-3xl font-black tracking-[-0.03em] text-[#123c35] dark:text-white md:text-4xl">
          Weekly plans
        </h2>
        <p className="mt-4 max-w-2xl text-[#5d726a] dark:text-foreground/70">
          {hidden
            ? "All four plans include the same teaching. Your monthly fee is confirmed after your free first lesson, once we know the schedule your family needs."
            : "Prices are in US dollars and cover a full month of classes. The more days you choose, the lower each class costs."}
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-3xl border bg-white/80 p-6 dark:bg-white/5 ${
                plan.popular
                  ? "border-[#1d5145] shadow-[0_18px_38px_rgba(29,81,69,0.16)] dark:border-green-500"
                  : "border-[#e2e8dc] dark:border-card-border"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-6 rounded-full bg-[#1d5145] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white dark:bg-green-600">
                  Most chosen
                </span>
              )}

              <h3 className="text-xl font-bold text-[#123c35] dark:text-white">
                {plan.daysPerWeek} days a week
              </h3>
              <p className="mt-1 text-sm text-[#7a8a80] dark:text-foreground/50">
                {plan.classesPerMonth} classes per month
              </p>

              <div className="mt-6 min-h-20">
                {hidden ? (
                  <p className="text-sm font-semibold leading-6 text-[#244c40] dark:text-foreground/80">
                    Fee confirmed after your free lesson
                  </p>
                ) : (
                  <>
                    <p className="text-4xl font-black tracking-[-0.03em] text-[#123c35] dark:text-white">
                      {usd(plan.priceUsd)}
                      <span className="ml-1 text-base font-semibold text-[#7a8a80] dark:text-foreground/50">
                        /month
                      </span>
                    </p>
                    <p className="mt-2 text-sm text-[#5d726a] dark:text-foreground/70">
                      {usd(perClassUsd(plan))} per {LESSON_MINUTES}-minute class
                    </p>
                  </>
                )}
              </div>

              <Link
                href="/signup"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1d4e47] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173f39] dark:bg-green-600 dark:hover:bg-green-500"
              >
                Book a free lesson <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>

        {!hidden && (
          <p className="mt-6 text-sm text-[#7a8a80] dark:text-foreground/50">
            Longer 45 and 60-minute classes are available by arrangement.
            Mention it when you book your free lesson and we will confirm the
            price with you.
          </p>
        )}
      </section>

      <section className="border-y border-[#e2e8dc] bg-white/50 dark:border-card-border dark:bg-white/5">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <h2 className="text-3xl font-black tracking-[-0.03em] text-[#123c35] dark:text-white md:text-4xl">
            Every plan includes
          </h2>
          <p className="mt-4 max-w-2xl text-[#5d726a] dark:text-foreground/70">
            The difference between plans is how often you learn, not what you
            get.
          </p>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {inclusions.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-[#e2e8dc] bg-white/80 p-5 dark:border-card-border dark:bg-white/5"
              >
                <item.icon
                  className="text-[#1d5145] dark:text-green-400"
                  size={22}
                />
                <h3 className="mt-3 font-bold text-[#123c35] dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#5d726a] dark:text-foreground/70">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-20">
        <h2 className="text-3xl font-black tracking-[-0.03em] text-[#123c35] dark:text-white md:text-4xl">
          Questions families ask
        </h2>
        <dl className="mt-10 space-y-8">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <dt className="flex items-start gap-3 text-lg font-bold text-[#123c35] dark:text-white">
                <CheckCircle2
                  className="mt-1 shrink-0 text-[#1d5145] dark:text-green-400"
                  size={18}
                />
                {faq.question}
              </dt>
              <dd className="mt-2 pl-[30px] leading-7 text-[#5d726a] dark:text-foreground/70">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-14 rounded-3xl border border-[#e2e8dc] bg-white/80 p-6 text-center dark:border-card-border dark:bg-white/5 md:p-10">
          <h2 className="text-2xl font-black text-[#123c35] dark:text-white">
            Try a lesson before you choose a plan
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[#5d726a] dark:text-foreground/70">
            Your first class is free. Tell us the days and times that suit your
            family, and we will match you with a teacher who teaches them.
          </p>
          <Link
            href="/signup"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1d4e47] px-6 py-3.5 text-base font-semibold text-white transition hover:bg-[#173f39] dark:bg-green-600 dark:hover:bg-green-500"
          >
            Book your free lesson <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
