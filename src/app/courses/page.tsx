import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Languages,
  Mic2,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import { SiteFooter } from "@/components/SiteFooter";
import { SignUpCta } from "@/components/SignUpCta";

import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Online Quran Courses and Programmes",
  description:
    "Explore Ana Quran Academy's online programmes: Quran reading, Tajweed, memorization, Arabic, and Islamic studies. One-to-one lessons in English, scheduled in your time zone.",
  path: "/courses",
  keywords: [
    "online Quran courses",
    "online Quran programmes",
    "learn Quran online",
    "Quran classes online",
    "online Tajweed course",
    "online Quran memorization programme",
  ],
});

type Pathway = {
  icon: LucideIcon;
  title: string;
  description: string;
  guide?: { label: string; href: string };
  programme?: { label: string; href: string };
};

const pathways: Pathway[] = [
  {
    icon: BookOpen,
    title: "Quran reading and recitation",
    description:
      "Start with Arabic letters and sounds, then move to reading with vowels and reciting full passages with confidence.",
    guide: {
      label: "Read the beginner's guide",
      href: "/blog/how-to-learn-quran-online",
    },
  },
  {
    icon: Mic2,
    title: "Tajweed",
    description:
      "Learn articulation points, pronunciation, and recitation rules, with correction in every lesson rather than theory alone.",
    programme: {
      label: "View the Tajweed programme",
      href: "/courses/tajweed",
    },
    guide: {
      label: "What Tajweed lessons cover",
      href: "/blog/learn-quran-with-tajweed",
    },
  },
  {
    icon: Sparkles,
    title: "Quran memorization (Hifz)",
    description:
      "Follow a structured memorization plan with new portions, regular review, and a pace matched to the student's ability.",
    guide: {
      label: "How memorization plans work",
      href: "/blog/quran-memorization-online",
    },
  },
  {
    icon: Languages,
    title: "Arabic",
    description:
      "Study reading, vocabulary, and grammar foundations, including Arabic for understanding the Quran.",
  },
  {
    icon: GraduationCap,
    title: "Islamic studies",
    description:
      "Explore core beliefs, worship, and history in clear English, adapted to the student's level.",
  },
];

const steps = [
  {
    title: "Create your account",
    description:
      "Tell us who is learning and what they would like to study. New students begin with a free trial lesson.",
  },
  {
    title: "Choose a teacher and weekly times",
    description:
      "Review teachers and their published availability, then pick weekly times that fit your routine. Times appear in your local time zone.",
  },
  {
    title: "Meet in the live classroom",
    description:
      "Join each lesson online from a browser or the mobile app. Every lesson is one teacher and one student.",
  },
  {
    title: "Keep a steady weekly rhythm",
    description:
      "Your weekly plan stays in place, with lesson reports and progress visible in your account.",
  },
];

export default function CoursesPage() {
  const url = absoluteUrl("/courses");

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
      {
        "@type": "ListItem",
        position: 2,
        name: "Courses",
        item: url,
      },
    ],
  };

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#webpage`,
    url,
    name: "Online Quran Courses and Programmes",
    description:
      "Ana Quran Academy's online programmes: Quran reading, Tajweed, memorization, Arabic, and Islamic studies, taught one-to-one in English.",
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <main className="overflow-hidden bg-[#f3efe8] text-[#173b35] dark:bg-background dark:text-foreground">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={pageSchema} />

      <section className="relative isolate border-b border-[#e2e8dc] dark:border-card-border">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_10%,rgba(206,224,197,0.42),transparent_32%),linear-gradient(135deg,#f3efe8_0%,#eef3e9_100%)] dark:bg-[radial-gradient(circle_at_85%_10%,rgba(124,167,130,0.18),transparent_32%),linear-gradient(135deg,#162f45_0%,#1a3a52_100%)]" />
        <div className="mx-auto max-w-5xl px-5 pb-16 pt-28 md:px-8 md:pb-20 md:pt-36">
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
                Courses
              </li>
            </ol>
          </nav>

          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[#123c35] dark:text-white sm:text-5xl md:text-6xl">
            Online Quran courses, taught one-to-one.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5d726a] dark:text-foreground/70">
            Every programme at {SITE_NAME} is built around a single student and
            a single teacher. Lessons run in English, last 30, 45, or 60
            minutes, and follow the weekly times you choose. New students start
            with a free trial lesson.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <SignUpCta
              label="Start with a free trial"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1d4e47] px-6 py-3.5 text-base font-semibold text-white shadow-[0_12px_22px_rgba(29,78,71,0.18)] transition hover:-translate-y-0.5 hover:bg-[#173f39] dark:bg-green-600 dark:hover:bg-green-500"
            />
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-2xl border border-[#cedacd] bg-white/70 px-6 py-3.5 text-base font-semibold text-[#244c40] transition hover:bg-white dark:border-[#3a5a7a] dark:bg-white/10 dark:text-foreground dark:hover:bg-white/15"
            >
              Ask about a programme
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
              Featured programme
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#173b35] dark:text-foreground sm:text-4xl">
              Online Quran classes for kids
            </h2>
          </div>
          <Link
            href="/courses/quran-for-kids"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1d5145] hover:gap-3 dark:text-green-400"
          >
            View the kids programme <ArrowRight size={16} aria-hidden />
          </Link>
        </div>

        <article className="mt-8 overflow-hidden rounded-[2rem] border border-[#dfe7d9] bg-white shadow-sm dark:border-card-border dark:bg-card-bg">
          <div className="grid gap-0 md:grid-cols-[1.15fr_0.85fr]">
            <div className="p-7 md:p-10">
              <span className="inline-flex rounded-full bg-[#edf3e9] px-3 py-1 text-xs font-semibold text-[#4d7058] dark:bg-green-500/15 dark:text-green-300">
                Children and teenagers
              </span>
              <h3 className="mt-4 text-2xl font-bold text-[#173b35] dark:text-foreground sm:text-3xl">
                Short, focused lessons with one teacher
              </h3>
              <p className="mt-4 leading-8 text-[#5d726a] dark:text-foreground/70">
                Children learn letters, reading, Tajweed, and memorization with
                the same teacher each week. Lessons are adapted to the
                child&apos;s age and attention span, and a parent or guardian is
                welcome to stay in the room.
              </p>
              <ul className="mt-6 space-y-3 text-[#4f675c] dark:text-foreground/70">
                {[
                  "One teacher and one child in every lesson",
                  "30, 45, or 60 minute lessons",
                  "Taught in English",
                  "Weekly times chosen from the teacher's availability",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="mt-1 shrink-0 text-[#6b936c] dark:text-green-400"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-between gap-6 bg-[#eef3e9] p-7 dark:bg-[#16324a] md:p-10">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
                  Good to know
                </p>
                <dl className="mt-5 space-y-4 text-[#5d726a] dark:text-foreground/70">
                  <div>
                    <dt className="font-semibold text-[#23483c] dark:text-foreground">
                      Free trial
                    </dt>
                    <dd className="mt-1 leading-7">
                      The first lesson is free for a new student.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#23483c] dark:text-foreground">
                      Fees
                    </dt>
                    <dd className="mt-1 leading-7">
                      Billed monthly in US dollars by bank transfer. Published
                      weekly plans are on{" "}
                      <Link href="/plans" className="underline">
                        the plans page
                      </Link>
                      .
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#23483c] dark:text-foreground">
                      Time zones
                    </dt>
                    <dd className="mt-1 leading-7">
                      Your schedule is shown in your local time zone.
                    </dd>
                  </div>
                </dl>
              </div>
              <Link
                href="/courses/quran-for-kids"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1d4e47] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173f39] dark:bg-green-600 dark:hover:bg-green-500"
              >
                Explore the kids programme <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </article>
      </section>

      <section className="bg-[#eef3e9] py-16 dark:bg-[#16324a] md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
              Subjects
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#173b35] dark:text-foreground sm:text-4xl">
              What students can study.
            </h2>
            <p className="mt-4 leading-7 text-[#6b7c73] dark:text-foreground/70">
              Programmes are one-to-one and adapted to the student&apos;s level.
              Availability varies by teacher and subject.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pathways.map(
              ({ icon: Icon, title, description, guide, programme }) => (
                <article
                  key={title}
                  className="flex flex-col rounded-3xl border border-[#e5e9df] bg-white p-7 shadow-sm dark:border-card-border dark:bg-card-bg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf3e9] text-[#547a5d] dark:bg-green-500/15 dark:text-green-300">
                    <Icon size={23} />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-[#23483c] dark:text-foreground">
                    {title}
                  </h3>
                  <p className="mt-3 flex-1 leading-7 text-[#6b7c73] dark:text-foreground/70">
                    {description}
                  </p>
                  {programme && (
                    <Link
                      href={programme.href}
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1d4e47] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173f39] dark:bg-green-600 dark:hover:bg-green-500"
                    >
                      {programme.label} <ArrowRight size={15} aria-hidden />
                    </Link>
                  )}
                  {guide && (
                    <Link
                      href={guide.href}
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#1d5145] hover:gap-3 dark:text-green-400"
                    >
                      {guide.label} <ArrowRight size={15} aria-hidden />
                    </Link>
                  )}
                </article>
              )
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
              How it works
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#173b35] dark:text-foreground sm:text-4xl">
              From trial lesson to weekly rhythm.
            </h2>
            <p className="mt-5 leading-7 text-[#687b70] dark:text-foreground/70">
              Not sure which programme fits? Read how to{" "}
              <Link
                href="/blog/choose-online-quran-academy"
                className="font-semibold text-[#1d5145] underline decoration-[#b9cfc2] underline-offset-4 dark:text-green-400 dark:decoration-green-400/40"
              >
                choose an online Quran academy
              </Link>{" "}
              or ask the team directly.
            </p>
          </div>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="flex gap-5 rounded-2xl border border-[#dce6d8] bg-white p-6 shadow-sm dark:border-card-border dark:bg-card-bg"
              >
                <span className="text-2xl font-bold text-[#b47b3c] dark:text-amber-300">
                  {String(index + 1).padStart(2, "0")}
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
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8 md:pb-24">
        <div className="overflow-hidden rounded-[2rem] bg-[#1c5145] px-7 py-12 text-center text-white shadow-xl shadow-[#1c5145]/15 md:px-16 md:py-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Users size={27} />
          </div>
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Choose a programme and meet your teacher.
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-white/75">
            Create your account, pick a subject, and begin with a free trial
            lesson. Registration is open from anywhere, and lessons are taught
            in English.
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
