import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Headphones,
  Languages,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

import { SignUpCta } from "@/components/SignUpCta";
import { PlanChoiceCta } from "@/components/PlanChoiceCta";
import { SiteFooter } from "@/components/SiteFooter";
import { BlogCard } from "@/components/blog/BlogCard";
import { getBlogPost, type BlogPost } from "@/lib/blog";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_TITLE } from "@/lib/seo";
import { LESSON_MINUTES, perClassUsd, plans, usd } from "@/lib/plans";
import { pricingHidden } from "@/lib/pricing-visibility";

// Curated by what a first-time visitor needs, not by publish date: the
// getting-started guide, the Tajweed guide, and the parents' guide.
const featuredGuides = [
  "how-to-learn-quran-online",
  "learn-quran-with-tajweed",
  "online-quran-classes-for-kids",
]
  .map((slug) => getBlogPost(slug))
  .filter((post): post is BlogPost => post !== undefined);

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "Ana Quran Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

const steps = [
  {
    number: "01",
    title: "Meet your teacher",
    description:
      "We connect each student with a dedicated teacher who understands their goals and learning pace.",
  },
  {
    number: "02",
    title: "Choose your weekly times",
    description:
      "See each teacher’s weekly schedule and pick the times that fit your routine — as many as you need.",
  },
  {
    number: "03",
    title: "Learn one-to-one every week",
    description:
      "Your times lock in instantly and repeat every week. Join each lesson online, starting with a trial.",
  },
];

const benefits = [
  {
    icon: Users,
    title: "Personal attention",
    description:
      "Individual lessons shaped around each learner’s level, goals, and progress.",
  },
  {
    icon: CalendarDays,
    title: "Flexible scheduling",
    description:
      "Pick your teacher’s weekly times. Booking is instant and repeats every week.",
  },
  {
    icon: ShieldCheck,
    title: "A guided experience",
    description:
      "A clear weekly plan keeps students, teachers, and lesson times coordinated.",
  },
];

export default async function HomePage() {
  const hidden = await pricingHidden();
  return (
    <main className="overflow-hidden bg-[#f3efe8] text-[#173b35] dark:bg-background dark:text-foreground">
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(206,224,197,0.38),transparent_30%),linear-gradient(135deg,#f3efe8_0%,#eff3ea_100%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(124,167,130,0.18),transparent_30%),linear-gradient(135deg,#162f45_0%,#1a3a52_100%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-8 md:grid-cols-[1.02fr_0.98fr] md:gap-12 md:px-8 md:pb-28 md:pt-12">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#cfe1d3] bg-white/70 px-3 py-2 text-xs font-semibold text-[#54735c] shadow-sm dark:border-[#3a5a7a] dark:bg-white/10 dark:text-green-200 sm:mb-6 sm:px-4 sm:text-sm">
              <Sparkles
                size={16}
                className="text-[#8ab57d] dark:text-green-400"
              />{" "}
              Thoughtful learning, one lesson at a time
            </div>
            <h1 className="text-[2.8rem] font-black leading-[0.92] tracking-[-0.06em] text-[#123c35] dark:text-white sm:text-5xl md:text-6xl lg:text-[5.3rem]">
              Grow your
              <span className="block">connection</span>
              <span className="block">
                with the{" "}
                <span className="text-[#d1893d] dark:text-amber-300">
                  Quran
                </span>
              </span>
              <span className="block">and Arabic.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#5d726a] dark:text-foreground/70 sm:mt-6 sm:text-lg sm:leading-8">
              Learn Quran, Tajweed, Arabic, and Islamic studies with dedicated
              teachers in one-to-one online lessons, taught in English.
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:mt-9 sm:flex-row">
              <SignUpCta
                label="Start learning"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1d4e47] px-6 py-3.5 text-base font-semibold text-white shadow-[0_12px_22px_rgba(29,78,71,0.18)] transition hover:-translate-y-0.5 hover:bg-[#173f39] dark:bg-green-600 dark:hover:bg-green-500 sm:w-auto"
              />
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-[#cedaCD] bg-white/70 px-6 py-3.5 text-base font-semibold text-[#244c40] transition hover:bg-white dark:border-[#3a5a7a] dark:bg-white/10 dark:text-foreground dark:hover:bg-white/15 sm:w-auto"
              >
                Talk to our team
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-2 text-sm font-medium text-[#63766c] dark:text-foreground/60 sm:mt-10 sm:gap-x-7 sm:gap-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 shadow-sm ring-1 ring-[#e6e9e1] dark:bg-white/10 dark:ring-[#3a5a7a]">
                <CheckCircle2
                  size={17}
                  className="text-[#6b936c] dark:text-green-400"
                />{" "}
                One-to-one lessons
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 shadow-sm ring-1 ring-[#e6e9e1] dark:bg-white/10 dark:ring-[#3a5a7a]">
                <CheckCircle2
                  size={17}
                  className="text-[#6b936c] dark:text-green-400"
                />{" "}
                Flexible time slots
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 shadow-sm ring-1 ring-[#e6e9e1] dark:bg-white/10 dark:ring-[#3a5a7a]">
                <CheckCircle2
                  size={17}
                  className="text-[#6b936c] dark:text-green-400"
                />{" "}
                Learn from home
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute -right-5 -top-7 h-40 w-40 rounded-full bg-[#dfe8d6] blur-3xl dark:bg-green-500/20" />
            <div className="absolute -bottom-7 -left-7 h-44 w-44 rounded-full bg-[#ebd7b2] blur-3xl dark:bg-amber-500/15" />
            <div className="relative overflow-hidden rounded-[2.2rem] border border-[#dfeee1] bg-[#dfe9dd] p-3 shadow-[0_30px_50px_rgba(18,67,59,0.12)] dark:border-[#2f4f6b] dark:bg-[#1f3a52] dark:shadow-black/30">
              <div className="relative overflow-hidden rounded-[1.8rem]">
                <div className="grid aspect-[4/5] grid-cols-5 grid-rows-6 gap-2 sm:aspect-[5/4]">
                  <Image
                    src="/hero/child-reading.jpg"
                    alt="A student reading the Quran at home"
                    width={640}
                    height={954}
                    priority
                    className="col-span-3 row-span-6 h-full w-full rounded-[1.4rem] object-cover"
                  />
                  <Image
                    src="/hero/child-smiling.jpg"
                    alt="A student resting his hand on his Quran"
                    width={480}
                    height={360}
                    className="col-span-2 row-span-3 h-full w-full rounded-[1.4rem] object-cover"
                  />
                  <Image
                    src="/hero/child-girl.jpg"
                    alt="A student holding her Quran"
                    width={480}
                    height={360}
                    className="col-span-2 row-span-3 h-full w-full rounded-[1.4rem] object-cover"
                  />
                </div>

                {/* The pill and tagline sit over a photograph, so they carry
                    their own scrim instead of the panel's flat gradient. */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0e3b31]/75 via-[#0e3b31]/25 to-transparent" />

                <div className="absolute left-4 top-4 rounded-full border border-white/35 bg-white/20 px-3 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm">
                  Personal guidance
                </div>
                <div className="absolute left-4 top-[4.5rem] max-w-[15rem] text-[15px] font-semibold leading-tight text-white/95">
                  Easy way to learn Quran and Arabic online with tajweed.
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-white/95 px-3 py-2.5 shadow-[0_16px_30px_rgba(10,45,35,0.18)] ring-1 ring-[#e5ece1] backdrop-blur-sm dark:bg-[#12303f]/95 dark:ring-[#3a5a7a]">
                  <img
                    src="/logo-ana-quran-mark.svg?v=2026-11-07-1"
                    alt=""
                    width={26}
                    height={37}
                    className="h-9 w-auto shrink-0 dark:hidden"
                  />
                  <img
                    src="/logo-ana-quran-mark-light.svg?v=2026-11-07-1"
                    alt=""
                    width={26}
                    height={37}
                    className="hidden h-9 w-auto shrink-0 dark:block"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-[#173b35] dark:text-white">
                      Ana Quran Academy
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-[#5d726a] dark:text-foreground/70">
                      A meaningful learning journey starts with one lesson.
                    </span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 text-center">
                <div className="rounded-2xl bg-white/90 px-2 py-3 shadow-sm ring-1 ring-[#e5ece1] dark:bg-card-bg/90 dark:ring-[#3a5a7a]">
                  <BookOpen
                    className="mx-auto mb-1 text-[#6f8c69] dark:text-green-400"
                    size={20}
                  />
                  <p className="text-xs font-semibold text-[#34594b] dark:text-foreground">
                    Quran
                  </p>
                </div>
                <div className="rounded-2xl bg-white/90 px-2 py-3 shadow-sm ring-1 ring-[#e5ece1] dark:bg-card-bg/90 dark:ring-[#3a5a7a]">
                  <Languages
                    className="mx-auto mb-1 text-[#6f8c69] dark:text-green-400"
                    size={20}
                  />
                  <p className="text-xs font-semibold text-[#34594b] dark:text-foreground">
                    Arabic
                  </p>
                </div>
                <div className="rounded-2xl bg-white/90 px-2 py-3 shadow-sm ring-1 ring-[#e5ece1] dark:bg-card-bg/90 dark:ring-[#3a5a7a]">
                  <GraduationCap
                    className="mx-auto mb-1 text-[#6f8c69] dark:text-green-400"
                    size={20}
                  />
                  <p className="text-xs font-semibold text-[#34594b] dark:text-foreground">
                    Islamic studies
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="approach"
        className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
            The Ana Quran approach
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#173b35] dark:text-foreground sm:text-4xl">
            Learning that fits your life
          </h2>
          <p className="mt-4 leading-7 text-[#6b7c73] dark:text-foreground/70">
            A supportive relationship with your teacher, a clear plan, and the
            flexibility to keep making progress.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-3xl border border-[#e5e9df] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-card-border dark:bg-card-bg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf3e9] text-[#547a5d] dark:bg-green-500/15 dark:text-green-300">
                <Icon size={23} />
              </div>
              <h3 className="mt-5 text-xl font-bold text-[#23483c] dark:text-foreground">
                {title}
              </h3>
              <p className="mt-3 leading-7 text-[#6b7c73] dark:text-foreground/70">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="bg-[#eef3e9] py-20 md:py-24 dark:bg-[#16324a]"
      >
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
                Getting started
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#173b35] dark:text-foreground sm:text-4xl">
                Simple steps. Personal progress.
              </h2>
              <p className="mt-5 leading-7 text-[#687b70] dark:text-foreground/70">
                From your first sign-up to your next lesson, we make it easy to
                stay connected and keep learning.
              </p>
              <SignUpCta
                label="Create your student account"
                className="mt-7 inline-flex items-center gap-2 font-semibold text-[#1d5144] hover:gap-3 dark:text-green-400"
              />
              <p className="mt-6 text-sm leading-7 text-[#687b70] dark:text-foreground/70">
                Looking for a specific programme? See{" "}
                <Link
                  href="/courses"
                  className="font-semibold text-[#1d5145] underline decoration-[#b9cfc2] underline-offset-4 dark:text-green-400 dark:decoration-green-400/40"
                >
                  all programmes
                </Link>
                ,{" "}
                <Link
                  href="/courses/quran-for-kids"
                  className="font-semibold text-[#1d5145] underline decoration-[#b9cfc2] underline-offset-4 dark:text-green-400 dark:decoration-green-400/40"
                >
                  Quran classes for kids
                </Link>
                , or{" "}
                <Link
                  href="/courses/tajweed"
                  className="font-semibold text-[#1d5145] underline decoration-[#b9cfc2] underline-offset-4 dark:text-green-400 dark:decoration-green-400/40"
                >
                  Tajweed classes
                </Link>
                .
              </p>
            </div>
            <div className="space-y-4">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="flex gap-5 rounded-2xl border border-[#dce6d8] bg-white p-6 shadow-sm dark:border-card-border dark:bg-card-bg"
                >
                  <span className="text-2xl font-bold text-[#b47b3c] dark:text-amber-300">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-[#23483c] dark:text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 leading-7 text-[#6b7c73] dark:text-foreground/70">
                      {step.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {!hidden && (
        <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
          <div className="rounded-[2rem] border border-[#dce6d8] bg-white px-7 py-10 shadow-sm dark:border-card-border dark:bg-card-bg md:px-10">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
                  Weekly plans
                </p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#173b35] dark:text-foreground sm:text-3xl">
                  {`${usd(plans[0].priceUsd)} to ${usd(plans[plans.length - 1].priceUsd)} a month`}
                </h2>
                <p className="mt-3 max-w-xl leading-7 text-[#6b7c73] dark:text-foreground/70">
                  One-to-one {LESSON_MINUTES}-minute classes with the same
                  teacher every week. Choose two to five days, pay after the
                  month, and only for lessons that actually took place.
                </p>
              </div>
              <Link
                href="/plans"
                className="inline-flex items-center gap-2 rounded-xl font-semibold text-[#1d5144] hover:gap-3 dark:text-green-400"
              >
                See all plans and what is included <ArrowRight size={18} />
              </Link>
            </div>

            <ul className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => (
                <li
                  key={plan.id}
                  className={`flex flex-col rounded-2xl border px-5 py-4 ${
                    plan.popular
                      ? "border-[#1d5145] bg-[#f2f7f1] dark:border-green-500 dark:bg-green-500/10"
                      : "border-[#e2e8dc] bg-[#f7faf5] dark:border-card-border dark:bg-white/5"
                  }`}
                >
                  <p className="text-sm font-bold text-[#24483b] dark:text-foreground">
                    {plan.daysPerWeek} days a week
                    {plan.popular && (
                      <span className="ml-2 rounded-full bg-[#1d5145] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white dark:bg-green-600">
                        Most chosen
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-2xl font-black tracking-[-0.03em] text-[#123c35] dark:text-white">
                    {usd(plan.priceUsd)}
                    <span className="ml-1 text-sm font-semibold text-[#7a8a80] dark:text-foreground/50">
                      /month
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-[#6b7c73] dark:text-foreground/70">
                    {plan.classesPerMonth} classes · {usd(perClassUsd(plan))}{" "}
                    each
                  </p>

                  <div className="mt-auto pt-4">
                    <PlanChoiceCta
                      daysPerWeek={plan.daysPerWeek}
                      label="Start with this plan"
                      arrowSize={16}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d4e47] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173f39] dark:bg-green-600 dark:hover:bg-green-500"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
              Quran learning guides
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#173b35] dark:text-foreground sm:text-4xl">
              Practical answers before you start.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-[#687b70] dark:text-foreground/70">
              Clear guides on learning Quran online, starting Tajweed, and
              choosing lessons for children — with more on{" "}
              <Link
                href="/blog"
                className="font-semibold text-[#1d5145] underline decoration-[#b9cfc2] underline-offset-4 dark:text-green-400 dark:decoration-green-400/40"
              >
                the blog
              </Link>
              , including how to choose an academy and how memorization plans
              work.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-semibold text-[#1d5144] hover:gap-3 dark:text-green-400"
          >
            Visit the blog <ArrowRight size={18} />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {featuredGuides.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
        <div className="overflow-hidden rounded-[2rem] bg-[#1c5145] px-7 py-12 text-center text-white shadow-xl shadow-[#1c5145]/15 md:px-16 md:py-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Headphones size={27} />
          </div>
          <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-[#d8c29f]">
            Your next step
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Make space for learning that matters.
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-white/75">
            Create your account and connect with the Ana Quran team to begin
            your learning journey.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <SignUpCta
              label="Get started"
              withArrow={false}
              className="rounded-xl bg-[#e4c18e] px-6 py-3.5 font-semibold text-[#24483b] transition hover:bg-[#efd1a4]"
            />
            <Link
              href="/contact"
              className="rounded-xl border border-white/30 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
