import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Globe2,
  Headphones,
  Mic2,
  Sparkles,
  Users,
} from "lucide-react";

import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Online Tajweed Classes with One-to-One Correction",
  description:
    "Online Tajweed classes taught one-to-one in English: letters, madd, the noon rules, and qalqalah applied while you recite, with correction in every lesson.",
  path: "/courses/tajweed",
  keywords: [
    "online Tajweed classes",
    "learn Tajweed online",
    "Tajweed lessons for beginners",
    "Quran recitation lessons online",
    "Tajweed teacher online",
    "Quran pronunciation lessons",
    "improve Quran recitation",
  ],
  image: "/courses/tajweed/opengraph-image",
  imageAlt: `Online Tajweed classes at ${SITE_NAME}`,
});

const stages = [
  {
    icon: BookOpen,
    title: "Correct letters first",
    description:
      "Each Arabic letter has its own point of articulation, and several pairs are easy to confuse when they are learned quickly. Lessons isolate those letters and drill them in short words before they appear in verses.",
  },
  {
    icon: Clock3,
    title: "Vowel lengths (madd)",
    description:
      "Holding a vowel for the right count is one of the first things a listener notices. You practise the natural lengths, then the cases that extend them, until the difference is audible in your own recitation.",
  },
  {
    icon: Mic2,
    title: "The noon and tanween rules",
    description:
      "When a silent noon or tanween meets another letter, the sound changes. These rules appear constantly in short surahs, so they are worked through one at a time in the text you are already reading.",
  },
  {
    icon: Sparkles,
    title: "Qalqalah and stopping",
    description:
      "The echoing sound on certain letters, and how to stop cleanly on the end of a verse, are usually the first refinements that make recitation sound settled rather than hurried.",
  },
];

const lessonShape = [
  {
    title: "You recite, the teacher listens",
    description:
      "Most of the lesson is you reading aloud. The teacher hears exactly where letters, lengths, or stops break down, instead of guessing from a general question.",
  },
  {
    title: "One rule at a time, in English",
    description:
      "The rule is explained in plain English, with the Arabic term alongside it, and demonstrated on two or three verses before you try it yourself.",
  },
  {
    title: "Applied practice with live correction",
    description:
      "You recite a passage that contains the rule repeatedly while the teacher corrects each slip. This is the part that changes recitation; the explanation alone does not.",
  },
  {
    title: "A short, specific task",
    description:
      "You leave with one rule to protect and a few verses to practise, so home practice stays short enough to actually happen between lessons.",
  },
];

const faqs = [
  {
    question: "Do I need to speak Arabic to start?",
    answer:
      "No. Lessons are taught in English, including the explanation of Tajweed terms and Arabic letters. You learn the Arabic names of the rules as you need them, not as a prerequisite.",
  },
  {
    question: "I cannot read the letters yet. Is this the right class?",
    answer:
      "Not yet, usually. Tajweed rules are hard to hear in text you cannot read. If the letters are still unstable, start with reading and add rules as reading becomes steady. The teacher will say so honestly in the trial lesson. Our guide on how to learn Quran online explains that first stage.",
  },
  {
    question: "How quickly will I notice a difference?",
    answer:
      "Most students hear a change in one or two letters within a few weeks, and a clearer difference in length and steadiness after a couple of months. Progress is gradual, so be cautious of anyone promising perfect recitation on a fixed date.",
  },
  {
    question: "Do I need a specific Mushaf or reciter?",
    answer:
      "Use one Mushaf and keep the same printed layout, because visual memory supports recitation. Listening to one consistent reciter also helps. Your teacher can suggest what suits your level.",
  },
  {
    question: "Are lessons one-to-one, and does the teacher stay the same?",
    answer:
      "Every lesson is one teacher and one student. The teacher who meets you in the trial lesson stays with you week to week, so correction builds on what was already covered.",
  },
  {
    question: "What equipment do I need?",
    answer:
      "A reliable internet connection, a device with a microphone, and a quiet space. A camera helps but is not always required. Lessons run in the academy's online classroom from a browser or the mobile app, so there is no separate software to install.",
  },
  {
    question: "What does it cost?",
    answer:
      "The first lesson is free for a new student. After that, lessons are billed monthly in US dollars by bank transfer, and the amount depends on the teacher's rate and the lesson length you choose.",
  },
];

export default function TajweedCoursePage() {
  const url = absoluteUrl("/courses/tajweed");

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${url}#course`,
    name: "Online Tajweed Classes",
    description:
      "One-to-one online Tajweed lessons taught in English, with live correction of letters, vowel lengths, the noon and tanween rules, and qalqalah while the student recites.",
    url,
    inLanguage: "en",
    provider: { "@id": `${SITE_URL}/#organization` },
    educationalLevel: "Beginner to advanced",
    teaches: [
      "Arabic letter articulation points",
      "Vowel lengths (madd)",
      "Rules of noon sakinah and tanween",
      "Qalqalah and stopping on verses",
      "Recitation of short surahs with correction",
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
        name: "Online Tajweed Classes",
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
                Tajweed
              </li>
            </ol>
          </nav>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#cfe1d3] bg-white/70 px-3 py-2 text-xs font-semibold text-[#54735c] shadow-sm dark:border-[#3a5a7a] dark:bg-white/10 dark:text-green-200 sm:px-4 sm:text-sm">
            <Mic2 size={16} className="text-[#8ab57d] dark:text-green-400" />
            One-to-one lessons in English
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[#123c35] dark:text-white sm:text-5xl md:text-6xl">
            Online Tajweed classes, corrected while you recite.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5d726a] dark:text-foreground/70">
            Tajweed is a skill, so it is learned by reciting and being
            corrected, not by memorizing rule names. In every lesson you read
            aloud while the teacher hears your letters, lengths, and stops, and
            fixes them one rule at a time.
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
              Ask about your level
            </Link>
          </div>
          <ul className="mt-8 grid gap-3 text-sm text-[#5d726a] dark:text-foreground/70 sm:grid-cols-2">
            {[
              "The first lesson is free",
              "30, 45, or 60 minute lessons",
              "Correction while you recite, not theory alone",
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
            What you work on
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#173b35] dark:text-foreground sm:text-4xl">
            The rules that change how you sound first.
          </h2>
          <p className="mt-4 leading-7 text-[#6b7c73] dark:text-foreground/70">
            Most beginners meet these four areas in roughly this order. The
            teacher starts from what your recitation actually needs, so the
            sequence adapts to you.
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
                You read aloud for most of the time.
              </h2>
              <p className="mt-5 leading-7 text-[#687b70] dark:text-foreground/70">
                A Tajweed lesson is not a lecture. The explanation is short, and
                the rest of the hour is recitation, correction, and repetition
                until the rule holds on its own.
              </p>
              <p className="mt-4 rounded-2xl border border-[#dfe7d9] bg-white/70 p-5 leading-7 text-[#4f675c] dark:border-card-border dark:bg-card-bg dark:text-foreground/70">
                For what the first months look like, and the mistakes beginners
                usually make, read our{" "}
                <Link
                  href="/blog/learn-quran-with-tajweed"
                  className="font-semibold text-[#1d5145] underline decoration-[#b9cfc2] underline-offset-4 dark:text-green-400 dark:decoration-green-400/40"
                >
                  beginner&apos;s guide to learning Quran with Tajweed
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
              <Headphones size={23} />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-[#173b35] dark:text-foreground">
              If you can read but want it corrected
            </h2>
            <p className="mt-3 leading-7 text-[#6b7c73] dark:text-foreground/70">
              This is the most common starting point. You read the page, but
              letters slip, vowels are shortened, and you are not sure what
              sounds right. The first lesson hears exactly where, and the plan
              starts from those letters rather than from a rule list.
            </p>
            <p className="mt-3 leading-7 text-[#6b7c73] dark:text-foreground/70">
              Still finding the letters? Read{" "}
              <Link
                href="/blog/how-to-learn-quran-online"
                className="font-semibold text-[#1d5145] underline decoration-[#b9cfc2] underline-offset-4 dark:text-green-400 dark:decoration-green-400/40"
              >
                how to learn Quran online
              </Link>{" "}
              first.
            </p>
          </article>

          <article className="rounded-3xl border border-[#e5e9df] bg-white p-7 shadow-sm dark:border-card-border dark:bg-card-bg md:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf3e9] text-[#547a5d] dark:bg-green-500/15 dark:text-green-300">
              <Users size={23} />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-[#173b35] dark:text-foreground">
              If you are memorizing, or plan to
            </h2>
            <p className="mt-3 leading-7 text-[#6b7c73] dark:text-foreground/70">
              Memorizing accurate recitation is worth doing; memorizing a
              mistake takes far longer to undo. Many students tighten the short
              surahs first, then add a structured Hifz plan with the same
              teacher.
            </p>
            <p className="mt-3 leading-7 text-[#6b7c73] dark:text-foreground/70">
              See{" "}
              <Link
                href="/blog/quran-memorization-online"
                className="font-semibold text-[#1d5145] underline decoration-[#b9cfc2] underline-offset-4 dark:text-green-400 dark:decoration-green-400/40"
              >
                how a memorization routine works
              </Link>{" "}
              for the revision side. Children and teenagers usually start with{" "}
              <Link
                href="/courses/quran-for-kids"
                className="font-semibold text-[#1d5145] underline decoration-[#b9cfc2] underline-offset-4 dark:text-green-400 dark:decoration-green-400/40"
              >
                the kids programme
              </Link>{" "}
              instead.
            </p>
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
              Clear before you commit.
            </h2>
            <p className="mt-5 leading-7 text-[#6b7c73] dark:text-foreground/70">
              The first lesson is free for a new student. After that, lessons
              are billed monthly in US dollars by bank transfer, and the amount
              depends on the teacher&apos;s rate and the lesson length you
              choose. Your bank may apply its own conversion or transfer fees.
            </p>
            <p className="mt-4 leading-7 text-[#6b7c73] dark:text-foreground/70">
              Weekly times come from each teacher&apos;s published availability
              and are shown in your local time zone. Teachers apply with their
              experience and CV, and every application is reviewed before
              onboarding.
            </p>
          </div>

          <div className="rounded-3xl border border-[#e5e9df] bg-[#f7f5ef] p-7 dark:border-card-border dark:bg-background md:p-9">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
              Enrolment
            </p>
            <h2 className="mt-3 text-2xl font-bold text-[#173b35] dark:text-foreground">
              Where we can register students.
            </h2>
            <p className="mt-4 leading-7 text-[#5d726a] dark:text-foreground/70">
              Website registration is currently open to students in the United
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
            Questions students ask
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
            <BookOpen size={27} />
          </div>
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Let a teacher hear where it slips.
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-white/75">
            Recite a few verses in the free trial lesson, and find out which
            letters and rules to work on first.
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
            Lessons taught in English, in your time zone
          </p>
        </div>
      </section>
    </main>
  );
}
