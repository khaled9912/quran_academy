import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Globe2,
  GraduationCap,
  Languages,
  Mic2,
  Sparkles,
  Users,
} from "lucide-react";

import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description:
    "Ana Quran Academy is an online Quran academy for English-speaking students. Learn Quran, Tajweed, memorization, Arabic, and Islamic studies one-to-one, taught in English.",
  path: "/about",
  keywords: [
    "online Quran academy in English",
    "Quran academy for English speakers",
    "online Quran classes in the US and UK",
    "learn Quran online with qualified teachers",
    "private Quran lessons in English",
  ],
});

const subjects = [
  {
    icon: BookOpen,
    title: "Quran reading",
    description:
      "Build confidence reading the Quran, from letter recognition and fluency to complete recitation.",
  },
  {
    icon: Mic2,
    title: "Tajweed",
    description:
      "Learn articulation points, pronunciation, and recitation rules with guided practice in every lesson.",
  },
  {
    icon: Sparkles,
    title: "Memorization",
    description:
      "Follow a structured Hifz plan with regular review and a pace that fits the student's ability.",
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
      "Tell us who is learning and what you would like to study. New students begin with a free trial lesson.",
  },
  {
    title: "Choose a teacher and weekly times",
    description:
      "Review teachers and their published availability, then pick the weekly times that fit your routine. Times are shown in your local time zone.",
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

const faqs = [
  {
    question: "Do I need to live in a particular country?",
    answer:
      "No. Registration is open from anywhere, and what qualifies a student is following the lesson in English. You need an internet connection and a suitable device, and lesson times depend on teacher availability in your time zone.",
  },
  {
    question: "Are lessons taught in English?",
    answer: "Yes. Lessons and communication with the academy are in English.",
  },
  {
    question: "Can children and adults learn?",
    answer:
      "Yes. Lessons are one-to-one and adapted to the student's age, level, and goals, from complete beginners to students working on Tajweed or memorization.",
  },
  {
    question: "Is the first lesson free?",
    answer:
      "Yes. A new student's first lesson is a free trial. After that, lessons are billed monthly.",
  },
  {
    question: "How are fees handled?",
    answer:
      "Lesson fees depend on the teacher's rate and the lesson length, and are billed monthly in US dollars (USD) by bank transfer. Your bank may apply its own conversion or transfer fees.",
  },
  {
    question: "Does the academy have local branches?",
    answer:
      "No. Ana Quran Academy is an online academy based in Egypt. We do not operate local branches or a physical campus, and we do not claim a local address in the countries our students live in.",
  },
];

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

export default function AboutPage() {
  return (
    <main className="overflow-hidden bg-[#f3efe8] text-[#173b35] dark:bg-background dark:text-foreground">
      <JsonLd data={faqSchema} />

      <section className="relative isolate border-b border-[#e2e8dc] dark:border-card-border">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_10%,rgba(206,224,197,0.42),transparent_32%),linear-gradient(135deg,#f3efe8_0%,#eef3e9_100%)] dark:bg-[radial-gradient(circle_at_85%_10%,rgba(124,167,130,0.18),transparent_32%),linear-gradient(135deg,#162f45_0%,#1a3a52_100%)]" />
        <div className="mx-auto max-w-5xl px-5 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe1d3] bg-white/70 px-3 py-2 text-xs font-semibold text-[#54735c] shadow-sm dark:border-[#3a5a7a] dark:bg-white/10 dark:text-green-200 sm:px-4 sm:text-sm">
            <Globe2 size={16} className="text-[#8ab57d] dark:text-green-400" />
            About Ana Quran Academy
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[#123c35] dark:text-white sm:text-5xl md:text-6xl">
            An online Quran academy for English-speaking students.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5d726a] dark:text-foreground/70">
            Ana Quran Academy teaches Quran, Tajweed, memorization, Arabic, and
            Islamic studies through one-to-one online lessons. Our teachers are
            based in Egypt, and every lesson pairs one teacher with one student,
            in English, from their own homes.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1d4e47] px-6 py-3.5 text-base font-semibold text-white shadow-[0_12px_22px_rgba(29,78,71,0.18)] transition hover:-translate-y-0.5 hover:bg-[#173f39] dark:bg-green-600 dark:hover:bg-green-500"
            >
              Start with a free trial <ArrowRight size={18} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-2xl border border-[#cedacd] bg-white/70 px-6 py-3.5 text-base font-semibold text-[#244c40] transition hover:bg-white dark:border-[#3a5a7a] dark:bg-white/10 dark:text-foreground dark:hover:bg-white/15"
            >
              Ask a question
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
              Where we teach
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#173b35] dark:text-foreground sm:text-4xl">
              One academy, English-speaking students wherever they live.
            </h2>
          </div>
          <div className="space-y-5 leading-8 text-[#5d726a] dark:text-foreground/70">
            <p>
              We are an online-first academy, not a local school tied to one
              city. Students join from wherever they live, and what qualifies a
              student is following the lesson in English. If you are unsure
              whether we can help, contact us and we will tell you what is
              possible.
            </p>
            <p>
              Lessons are taught in English, and your schedule is shown in your
              local time zone. Because each teacher publishes their own weekly
              availability, the times that work best depend on your time zone
              and the teacher you choose. Our team can help you find a good fit.
            </p>
            <p className="rounded-2xl border border-[#dfe7d9] bg-white/70 p-5 text-base leading-7 text-[#4f675c] dark:border-card-border dark:bg-card-bg dark:text-foreground/70">
              Ana Quran Academy is based in Egypt and operates online. We do not
              have local branches or a physical campus, and we do not claim a
              local address in the countries our students live in.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#eef3e9] py-16 md:py-20 dark:bg-[#16324a]">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
              What you can learn
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#173b35] dark:text-foreground sm:text-4xl">
              Programs built around each student.
            </h2>
            <p className="mt-4 leading-7 text-[#6b7c73] dark:text-foreground/70">
              Every program is one-to-one and adapted to the student&apos;s
              level, goals, and pace. Availability varies by teacher and
              subject.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map(({ icon: Icon, title, description }) => (
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
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
              How it works
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#173b35] dark:text-foreground sm:text-4xl">
              A simple weekly rhythm.
            </h2>
            <p className="mt-5 leading-7 text-[#687b70] dark:text-foreground/70">
              From your first trial lesson to your weekly schedule, everything
              is kept in one place.
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

      <section className="border-y border-[#e2e8dc] bg-white py-16 dark:border-card-border dark:bg-card-bg md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-2 md:items-start md:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
              Our teachers
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#173b35] dark:text-foreground sm:text-4xl">
              Reviewed before they teach.
            </h2>
            <p className="mt-5 leading-7 text-[#6b7c73] dark:text-foreground/70">
              Teachers apply with their experience and CV, and every application
              is reviewed before onboarding. Approved teachers publish their
              weekly availability, and students book open times instantly.
            </p>
            <ul className="mt-6 space-y-3 text-[#4f675c] dark:text-foreground/70">
              {[
                "One teacher and one student in every lesson",
                "Lessons of 30, 45, or 60 minutes",
                "Teaching and communication in English",
                "A teaching team based in Egypt, teaching in English",
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

          <div className="rounded-3xl border border-[#e5e9df] bg-[#f7f5ef] p-7 dark:border-card-border dark:bg-background md:p-9">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
              Fees and scheduling
            </p>
            <h2 className="mt-3 text-2xl font-bold text-[#173b35] dark:text-foreground">
              Clear from the start.
            </h2>
            <dl className="mt-6 space-y-5 text-[#5d726a] dark:text-foreground/70">
              <div>
                <dt className="font-semibold text-[#23483c] dark:text-foreground">
                  Free trial
                </dt>
                <dd className="mt-1 leading-7">
                  A new student&apos;s first lesson is free.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#23483c] dark:text-foreground">
                  Currency
                </dt>
                <dd className="mt-1 leading-7">
                  Lesson fees are shown and billed monthly in US dollars (USD)
                  by bank transfer. Your bank may apply its own conversion or
                  transfer fees.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#23483c] dark:text-foreground">
                  Time zones
                </dt>
                <dd className="mt-1 leading-7">
                  Your schedule is displayed in your local time zone, and lesson
                  times are chosen from each teacher&apos;s published weekly
                  availability.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-20">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
            Common questions
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#173b35] dark:text-foreground sm:text-4xl">
            Frequently asked questions
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
            <Users size={27} />
          </div>
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Start learning from where you are.
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-white/75">
            Create your account, meet your teacher, and begin with a free trial
            lesson.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-xl bg-[#e4c18e] px-6 py-3.5 font-semibold text-[#24483b] transition hover:bg-[#efd1a4]"
            >
              Get started
            </Link>
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
