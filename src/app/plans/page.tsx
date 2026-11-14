import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  FileText,
  Globe2,
  Languages,
  UserCheck,
  Users,
} from "lucide-react";

import { JsonLd } from "@/components/JsonLd";
import { PlanChoiceCta } from "@/components/PlanChoiceCta";
import { SignUpCta } from "@/components/SignUpCta";
import { SiteFooter } from "@/components/SiteFooter";
import { absoluteUrl, pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import { LESSON_MINUTES, currencyName, money, perClass } from "@/lib/plans";
import { getPriceList, getLessonRules, pricedTiers } from "@/lib/pricing";
import type { LessonRules, PriceList } from "@/types/pricing";
import { restrictedVisitor } from "@/lib/pricing-visibility";

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

/**
 * The answers the page shows and the structured data repeats, built per render
 * from what this host actually runs. A page must not promise a card button this
 * host cannot open, name a currency it would not bill in, or quote a
 * cancellation window the rule row does not enforce.
 */
const questions = (pricing: PriceList | null, rules: LessonRules) => [
  {
    question: "How long is each class?",
    answer: `Every plan on this page is a series of ${LESSON_MINUTES}-minute classes. If your family needs 45 or 60 minutes, say so when you book your free lesson and we will arrange it with your teacher.`,
  },
  {
    question: "When do I pay?",
    answer:
      "Once the month has ended, never before it starts. Your account lists the classes that made up the month before you pay anything, and a month with no classes in it is not billed at all.",
  },
  {
    question: "How do I pay?",
    answer: pricing?.cardCheckout
      ? `By card on your payments page, in ${currencyName(
          pricing.currency
        )}. The card charge is your plan's price for the closed month. Card details go into Stripe, the payment company, and never into this site. Your family can instead send a bank transfer: your payments page shows the academy's dollar account and the amount for the classes that took place, you mark it sent and we confirm it.`
      : "By bank transfer to the academy's dollar account. Your payments page shows the account details and the amount for the classes that took place in the closed month. You send it, mark it as sent, and we confirm it.",
  },
  {
    question: "Can I cancel a lesson?",
    answer: `Yes, free of charge up to ${rules.freeCancelHours} hours before it starts. A cancellation inside those hours is recorded against you, because your teacher has already set the time aside. Your teacher or the academy can still propose a make-up time, and it is booked when you accept it. One late cancellation each month is excused on your record.`,
  },
  {
    question: "What if my teacher cancels?",
    answer:
      "Nothing is counted against you. The class is recorded as your teacher's cancellation, they can propose a make-up time for it, and repeated short-notice cancellations are reviewed by the academy.",
  },
  {
    question: "Can I change or stop my plan?",
    answer:
      "Yes. There is no contract term and nothing to cancel. Pick the days a week you want on this page whenever it changes, and you only ever pay for the months that actually had classes in them.",
  },
  {
    question: "Is the first lesson really free?",
    answer:
      "Yes. Your very first lesson costs nothing and carries no obligation to continue. It is how you judge the teacher before you commit to a monthly plan.",
  },
  {
    question: "Are there any other fees?",
    answer: `No sign-up fee and no charge for materials. One month's plan price is the whole cost for that month. A class you cancel inside ${rules.freeCancelHours} hours still counts as one of the classes you paid for, as above.`,
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const hidden = await restrictedVisitor();
  const pricing = hidden ? null : await getPriceList();
  const cheapest = pricing
    ? Math.min(...pricing.plans.map((plan) => plan.monthlyAmount))
    : 0;

  return pageMetadata({
    title: hidden
      ? "Plans and Weekly Schedules"
      : "Online Quran Class Plans and Prices",
    description: cheapest
      ? `Online Quran class plans from ${money(cheapest, pricing!.currency)} a month: one-to-one lessons in English, ${LESSON_MINUTES} minutes each, two to five days a week. Pay after the month, and start with a free first lesson.`
      : `Online Quran class plans: one-to-one lessons in English, ${LESSON_MINUTES} minutes each, two to five days a week. Your monthly fee is confirmed after your free first lesson.`,
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

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ currency?: string }>;
}) {
  const hidden = await restrictedVisitor();
  const pricing = hidden
    ? null
    : await getPriceList((await searchParams).currency);
  const faqs = questions(pricing, await getLessonRules());
  const url = absoluteUrl("/plans");

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
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

  // A tier carries a figure only when the server has a price for it, in the
  // currency this visitor would be billed in.
  const tiers = pricedTiers(pricing);

  // Only reached when there is a tier to price, so the fallback is unreachable.
  const currency = pricing?.currency ?? "USD";

  // Prices are deliberately absent from structured data when the visitor's
  // country is gated, so the figures do not surface through search results.
  const planSchemas = tiers.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: tiers.map((plan, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Offer",
            name: `${plan.daysPerWeek} days a week`,
            description: `${plan.classesPerMonth} one-to-one ${LESSON_MINUTES}-minute Quran classes per month.`,
            price: plan.monthlyAmount.toFixed(2),
            priceCurrency: currency,
            url,
            availability: "https://schema.org/InStock",
          },
        })),
      }
    : undefined;

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
            <SignUpCta
              label="Start with a free lesson"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1d4e47] px-6 py-3.5 text-base font-semibold text-white shadow-[0_12px_22px_rgba(29,78,71,0.18)] transition hover:-translate-y-0.5 hover:bg-[#173f39] dark:bg-green-600 dark:hover:bg-green-500"
            />
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
          {pricing
            ? `Prices are shown in ${currencyName(pricing.currency)} and cover a full month of classes. The more days you choose, the lower each class costs.`
            : `Classes run in blocks of ${LESSON_MINUTES} minutes, from two to five days a week, with the same teacher kept every week. Your monthly fee is confirmed after your free first lesson, once we know the schedule your family needs.`}
        </p>

        {pricing && pricing.currencies.length > 1 && (
          <CurrencySwitcher
            currencies={pricing.currencies}
            current={pricing.currency}
          />
        )}

        {tiers.length > 0 && (
          <>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {tiers.map((plan) => (
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
                    <p className="text-4xl font-black tracking-[-0.03em] text-[#123c35] dark:text-white">
                      {money(plan.monthlyAmount, currency)}
                      <span className="ml-1 text-base font-semibold text-[#7a8a80] dark:text-foreground/50">
                        /month
                      </span>
                    </p>
                    <p className="mt-2 text-sm text-[#5d726a] dark:text-foreground/70">
                      {money(
                        perClass(plan.monthlyAmount, plan.classesPerMonth),
                        currency
                      )}{" "}
                      per {LESSON_MINUTES}-minute class
                    </p>
                  </div>

                  <PlanChoiceCta
                    daysPerWeek={plan.daysPerWeek}
                    label="Book a free lesson"
                    arrowSize={16}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1d4e47] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173f39] dark:bg-green-600 dark:hover:bg-green-500"
                  />
                </article>
              ))}
            </div>

            <p className="mt-6 text-sm text-[#7a8a80] dark:text-foreground/50">
              Longer 45 and 60-minute classes are available by arrangement.
              Mention it when you book your free lesson and we will confirm the
              price with you.
            </p>
          </>
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
          <SignUpCta
            label="Book your free lesson"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1d4e47] px-6 py-3.5 text-base font-semibold text-white transition hover:bg-[#173f39] dark:bg-green-600 dark:hover:bg-green-500"
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

/**
 * Prices for more than one currency sit behind one word: which currency the
 * card is charged in. This states the choice rather than inferring it, and the
 * figure a switcher shows is the figure an invoice would be issued for, because
 * both come from the same server lookup.
 */
function CurrencySwitcher({
  currencies,
  current,
}: {
  currencies: string[];
  current: string;
}) {
  return (
    <nav
      aria-label="Price currency"
      className="mt-8 flex flex-wrap items-center gap-2"
    >
      <span className="mr-1 text-sm font-semibold uppercase tracking-wider text-[#7a8a80] dark:text-foreground/50">
        Show prices in
      </span>
      {currencies.map((code) =>
        code === current ? (
          <span
            key={code}
            aria-current="true"
            className="rounded-full bg-[#1d4e47] px-4 py-2 text-sm font-bold text-white dark:bg-green-600"
          >
            {code}
          </span>
        ) : (
          <Link
            key={code}
            href={`/plans?currency=${encodeURIComponent(code)}`}
            className="rounded-full border border-[#cedacd] bg-white/70 px-4 py-2 text-sm font-semibold text-[#244c40] transition hover:bg-white dark:border-[#3a5a7a] dark:bg-white/10 dark:text-foreground dark:hover:bg-white/15"
          >
            {code}
          </Link>
        )
      )}
    </nav>
  );
}
