import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Globe2,
  GraduationCap,
  Mic2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { SiteFooter } from "@/components/SiteFooter";

import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Online Quran Classes for Kids",
  description:
    "One-to-one online Quran classes for children and teenagers, taught in English. Short lessons, reviewed teachers, Tajweed and memorization, and a free trial lesson.",
  path: "/courses/quran-for-kids",
  keywords: [
    "online Quran classes for kids",
    "Quran classes for children",
    "online Quran teacher for kids",
    "Quran classes for kids online",
    "online Quran learning for children",
    "Tajweed classes for kids",
    "Quran memorization for children",
  ],
  image: "/courses/quran-for-kids/opengraph-image",
  imageAlt: `Online Quran classes for kids at ${SITE_NAME}`,
});

const stages = [
  {
    icon: Sparkles,
    title: "Early years, around ages 4–6",
    description:
      "Letters, sounds, and very short surahs learned by listening and repeating. Lessons stay short and familiar, with the same order each week.",
  },
  {
    icon: BookOpen,
    title: "Building reading, ages 7–10",
    description:
      "Joining letters, reading with vowel marks, and finishing first words and verses. Simple Tajweed rules are introduced as reading becomes steady.",
  },
  {
    icon: Mic2,
    title: "Fluency and rules, ages 11–14",
    description:
      "Longer passages, clearer pronunciation, and Tajweed rules applied while reciting. Memorization includes a review schedule so earlier portions stay firm.",
  },
  {
    icon: GraduationCap,
    title: "Teenagers, ages 15–17",
    description:
      "Refining recitation, taking on a structured Hifz plan, and building the confidence to recite aloud and study independently.",
  },
];

const lessonShape = [
  {
    title: "A short review",
    description:
      "The teacher starts with what the child practised last time, so gaps are caught before new material is added.",
  },
  {
    title: "One clear objective",
    description:
      "Each lesson has one focus: a new letter, a rule, a passage, or a portion to memorize. Not a list of unrelated topics.",
  },
  {
    title: "Guided practice with correction",
    description:
      "The child reads aloud for most of the lesson. The teacher listens, corrects pronunciation, and repeats until it is right.",
  },
  {
    title: "A small, specific task",
    description:
      "Homework is short and precise, such as one line to practise or one portion to review, so it fits around school.",
  },
];

const faqs = [
  {
    question: "What age can my child start?",
    answer:
      "Most families begin between the ages of four and six with letters and sounds. Younger children usually start with 30-minute lessons, and the teacher will tell you honestly if a shorter or slower start suits your child better.",
  },
  {
    question: "Should a parent stay during the lesson?",
    answer:
      "For younger children, we recommend it. For older children, it is enough to be nearby and able to check in afterwards. Parents are welcome in the room at any age.",
  },
  {
    question: "What equipment do we need?",
    answer:
      "A reliable internet connection, a device with a camera and microphone, and a quiet space. Lessons run in the academy's online classroom from a browser or the mobile app, so there is no separate software to install.",
  },
  {
    question: "Are lessons taught in English?",
    answer:
      "Yes. Lessons and communication with the academy are in English, including explanations of Tajweed terms and Arabic letters.",
  },
  {
    question: "Can siblings learn at the same time?",
    answer:
      "Every lesson is one teacher and one student, so each child needs their own weekly slot. Siblings can study with the same teacher when that teacher's availability allows it.",
  },
  {
    question: "What happens if we miss a lesson?",
    answer:
      "Contact the academy team as early as possible. They will explain the options for that lesson and help you find another weekly time if your routine changes.",
  },
];

export default function QuranForKidsPage() {
  const url = absoluteUrl("/courses/quran-for-kids");

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${url}#course`,
    name: "Online Quran Classes for Kids",
    description:
      "One-to-one online Quran lessons for children and teenagers, taught in English. Reading, Tajweed, and memorization, with a pace adapted to the child's age.",
    url,
    inLanguage: "en",
    provider: { "@id": `${SITE_URL}/#organization` },
    educationalLevel: "Beginner to advanced",
    teaches: [
      "Quran reading",
      "Tajweed",
      "Quran memorization",
      "Arabic letters and pronunciation",
    ],
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      location: {
        "@type": "VirtualLocation",
        url,
      },
    },
  };

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
        item: absoluteUrl("/courses"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Online Quran Classes for Kids",
        item: url,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="overflow-hidden bg-[#f3efe8] text-[#173b35] dark:bg-background dark:text-foreground">
      <JsonLd data={courseSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <section className="relative isolate border-b border-[#e2e8dc] dark:border-card-border">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_10%,rgba(206,224,197,0.42),transparent_32%),linear-gradient(135deg,#f3efe8_0%,#eef3e9_100%)] dark:bg-[radial-gradient(circle_at_85%_10%,rgba(124,167,130,0.18),transparent_32%),linear-gradient(135deg,#162f45_0%,#1a3a52_100%)]" />
        <div className="mx-auto max-w-5xl px-5 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36">
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
              <li>
                <Link
                  href="/courses"
                  className="hover:text-[#1d5145] dark:hover:text-green-400"
                >
                  Courses
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li
                aria-current="page"
                className="text-[#4f675c] dark:text-foreground/70"
              >
                Quran for kids
              </li>
            </ol>
          </nav>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#cfe1d3] bg-white/70 px-3 py-2 text-xs font-semibold text-[#54735c] shadow-sm dark:border-[#3a5a7a] dark:bg-white/10 dark:text-green-200 sm:px-4 sm:text-sm">
            <Users size={16} className="text-[#8ab57d] dark:text-green-400" />
            One-to-one lessons in English
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[#123c35] dark:text-white sm:text-5xl md:text-6xl">
            Online Quran classes for kids.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5d726a] dark:text-foreground/70">
            Children and teenagers learn Quran, Tajweed, and memorization with
            one teacher, from home. Lessons are short enough to hold attention
            and structured enough to show real progress, and the same teacher
            stays with your child each week.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="registration-cta inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1d4e47] px-6 py-3.5 text-base font-semibold text-white shadow-[0_12px_22px_rgba(29,78,71,0.18)] transition hover:-translate-y-0.5 hover:bg-[#173f39] dark:bg-green-600 dark:hover:bg-green-500"
            >
              Start with a free trial <ArrowRight size={18} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-2xl border border-[#cedacd] bg-white/70 px-6 py-3.5 text-base font-semibold text-[#244c40] transition hover:bg-white dark:border-[#3a5a7a] dark:bg-white/10 dark:text-foreground dark:hover:bg-white/15"
            >
              Ask about your child
            </Link>
          </div>
          <ul className="mt-8 grid gap-3 text-sm text-[#5d726a] dark:text-foreground/70 sm:grid-cols-2">
            {[
              "The first lesson is free",
              "30, 45, or 60 minute lessons",
              "Reviewed teachers, teaching in English",
              "Times shown in your local time zone",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0 text-[#6b936c] dark:text-green-400"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
            Adapted to age
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#173b35] dark:text-foreground sm:text-4xl">
            What children work on at each stage.
          </h2>
          <p className="mt-4 leading-7 text-[#6b7c73] dark:text-foreground/70">
            Ages are a guide, not a rule. The teacher starts from what your
            child can already do and adjusts the pace from there.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {stages.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-3xl border border-[#e5e9df] bg-white p-7 shadow-sm dark:border-card-border dark:bg-card-bg"
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

      <section className="bg-[#eef3e9] py-16 dark:bg-[#16324a] md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="grid gap-12 md:grid-cols-[0.85fr_1.15fr] md:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
                Inside a lesson
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#173b35] dark:text-foreground sm:text-4xl">
                A predictable hour that moves.
              </h2>
              <p className="mt-5 leading-7 text-[#687b70] dark:text-foreground/70">
                Children settle faster when they know what comes next. Every
                lesson follows the same shape, whether it is 30, 45, or 60
                minutes long.
              </p>
              <p className="mt-4 rounded-2xl border border-[#dfe7d9] bg-white/70 p-5 leading-7 text-[#4f675c] dark:border-card-border dark:bg-card-bg dark:text-foreground/70">
                For a detailed look at choosing lesson length, routines, and
                online safety, read our{" "}
                <Link
                  href="/blog/online-quran-classes-for-kids"
                  className="font-semibold text-[#1d5145] underline decoration-[#b9cfc2] underline-offset-4 dark:text-green-400 dark:decoration-green-400/40"
                >
                  parent&apos;s guide to online Quran classes for kids
                </Link>
                .
              </p>
            </div>
            <div className="space-y-4">
              {lessonShape.map((item, index) => (
                <article
                  key={item.title}
                  className="flex gap-5 rounded-2xl border border-[#dce6d8] bg-white p-6 shadow-sm dark:border-card-border dark:bg-card-bg"
                >
                  <span className="text-2xl font-bold text-[#b47b3c] dark:text-amber-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-[#23483c] dark:text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 leading-7 text-[#6b7c73] dark:text-foreground/70">
                      {item.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <article className="rounded-3xl border border-[#e5e9df] bg-white p-7 shadow-sm dark:border-card-border dark:bg-card-bg md:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf3e9] text-[#547a5d] dark:bg-green-500/15 dark:text-green-300">
              <Users size={23} />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-[#173b35] dark:text-foreground">
              Who teaches your child
            </h2>
            <p className="mt-3 leading-7 text-[#6b7c73] dark:text-foreground/70">
              Teachers apply with their experience and CV, and every application
              is reviewed before onboarding. The teacher who meets your child in
              the trial lesson stays with them week to week, so progress does
              not restart with a new face.
            </p>
            <p className="mt-3 leading-7 text-[#6b7c73] dark:text-foreground/70">
              When you browse teachers, you can read ratings and reviews from
              completed lessons before choosing.
            </p>
          </article>

          <article className="rounded-3xl border border-[#e5e9df] bg-white p-7 shadow-sm dark:border-card-border dark:bg-card-bg md:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf3e9] text-[#547a5d] dark:bg-green-500/15 dark:text-green-300">
              <ShieldCheck size={23} />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-[#173b35] dark:text-foreground">
              Keeping lessons safe online
            </h2>
            <ul className="mt-4 space-y-3 leading-7 text-[#6b7c73] dark:text-foreground/70">
              {[
                "Every lesson is one teacher and one child, never a group call.",
                "A parent or guardian is welcome to stay in the room.",
                "Lesson links, scheduling, and payment stay inside your account.",
                "You can contact the academy team directly with any concern.",
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
          </article>
        </div>
      </section>

      <section className="border-y border-[#e2e8dc] bg-white py-16 dark:border-card-border dark:bg-card-bg md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-2 md:items-start md:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
              Fees and scheduling
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#173b35] dark:text-foreground sm:text-4xl">
              Simple, and clear before you start.
            </h2>
            <p className="mt-5 leading-7 text-[#6b7c73] dark:text-foreground/70">
              The first lesson is free for a new student. After that, lessons
              are billed monthly in US dollars by bank transfer, and the amount
              depends on the teacher&apos;s rate and the lesson length you
              choose. Your bank may apply its own conversion or transfer fees.
            </p>
            <p className="mt-4 leading-7 text-[#6b7c73] dark:text-foreground/70">
              Weekly times come from each teacher&apos;s published availability
              and are shown in your local time zone, so you can see the real
              times before you book.
            </p>
          </div>

          <div className="rounded-3xl border border-[#e5e9df] bg-[#f7f5ef] p-7 dark:border-card-border dark:bg-background md:p-9">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
              Enrolment
            </p>
            <h2 className="mt-3 text-2xl font-bold text-[#173b35] dark:text-foreground">
              Where we can register families.
            </h2>
            <p className="mt-4 leading-7 text-[#5d726a] dark:text-foreground/70">
              Website registration is currently open to families in the United
              States, United Kingdom, Canada, Australia, New Zealand, and
              Ireland. Lessons are taught in English.
            </p>
            <p className="mt-3 leading-7 text-[#5d726a] dark:text-foreground/70">
              If you are outside those countries,{" "}
              <Link
                href="/contact"
                className="font-semibold text-[#1d5145] underline decoration-[#b9cfc2] underline-offset-4 dark:text-green-400 dark:decoration-green-400/40"
              >
                contact the team
              </Link>{" "}
              and we will tell you what is possible.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="registration-cta inline-flex items-center justify-center gap-2 rounded-xl bg-[#1d4e47] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173f39] dark:bg-green-600 dark:hover:bg-green-500"
              >
                Book a free trial <ArrowRight size={16} />
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center rounded-xl border border-[#cedacd] px-5 py-3 text-sm font-semibold text-[#244c40] transition hover:bg-white dark:border-[#3a5a7a] dark:text-foreground dark:hover:bg-white/10"
              >
                All programmes
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-20">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
            Common questions
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#173b35] dark:text-foreground sm:text-4xl">
            Questions parents ask
          </h2>
        </div>
        <div className="mt-10 space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-[#dce6d8] bg-white p-6 shadow-sm dark:border-card-border dark:bg-card-bg"
            >
              <summary className="cursor-pointer list-none text-lg font-semibold text-[#23483c] dark:text-foreground">
                <span className="flex items-start justify-between gap-4">
                  {faq.question}
                  <span className="mt-1 text-[#8ab57d] transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 leading-7 text-[#6b7c73] dark:text-foreground/70">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8 md:pb-24">
        <div className="overflow-hidden rounded-[2rem] bg-[#1c5145] px-7 py-12 text-center text-white shadow-xl shadow-[#1c5145]/15 md:px-16 md:py-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Clock3 size={27} />
          </div>
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Start with a free trial lesson.
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-white/75">
            Meet the teacher, see how your child responds, and decide together
            before committing to a weekly plan.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="registration-cta rounded-xl bg-[#e4c18e] px-6 py-3.5 font-semibold text-[#24483b] transition hover:bg-[#efd1a4]"
            >
              Create an account
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-white/30 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
            >
              Contact us
            </Link>
          </div>
          <p className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 text-sm text-white/60">
            <Globe2 size={15} />
            Website registration is open to families in six countries
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
