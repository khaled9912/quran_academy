import Link from "next/link";
import Image from "next/image";
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

const steps = [
  {
    number: "01",
    title: "Meet your teacher",
    description:
      "We connect each student with a dedicated teacher who understands their goals and learning pace.",
  },
  {
    number: "02",
    title: "Choose a time that works",
    description:
      "Explore your teacher’s available slots and request the lesson time that fits your routine.",
  },
  {
    number: "03",
    title: "Learn one-to-one",
    description:
      "Once your teacher and our team approve the booking, join your lesson online.",
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
      "Choose from your teacher’s available times and book one lesson at a time.",
  },
  {
    icon: ShieldCheck,
    title: "A guided experience",
    description:
      "A clear approval process keeps students, teachers, and lesson times coordinated.",
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#f3efe8] text-[#173b35]">
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(206,224,197,0.38),transparent_30%),linear-gradient(135deg,#f3efe8_0%,#eff3ea_100%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-8 md:grid-cols-[1.02fr_0.98fr] md:gap-12 md:px-8 md:pb-28 md:pt-12">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#cfe1d3] bg-white/70 px-3 py-2 text-xs font-semibold text-[#54735c] shadow-sm sm:mb-6 sm:px-4 sm:text-sm">
              <Sparkles size={16} className="text-[#8ab57d]" /> Thoughtful learning, one lesson at a time
            </div>
            <h1 className="text-[2.8rem] font-black leading-[0.92] tracking-[-0.06em] text-[#123c35] sm:text-5xl md:text-6xl lg:text-[5.3rem]">
              Grow your
              <span className="block">connection</span>
              <span className="block">with the <span className="text-[#d1893d]">Quran</span></span>
              <span className="block">and Arabic.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#5d726a] sm:mt-6 sm:text-lg sm:leading-8">
              Learn with dedicated teachers through personal online lessons,
              flexible scheduling, and a learning experience built around you.
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:mt-9 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1d4e47] px-6 py-3.5 text-base font-semibold text-white shadow-[0_12px_22px_rgba(29,78,71,0.18)] transition hover:-translate-y-0.5 hover:bg-[#173f39] sm:w-auto"
              >
                Start learning <ArrowRight size={18} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-[#cedaCD] bg-white/70 px-6 py-3.5 text-base font-semibold text-[#244c40] transition hover:bg-white sm:w-auto"
              >
                Talk to our team
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-2 text-sm font-medium text-[#63766c] sm:mt-10 sm:gap-x-7 sm:gap-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 shadow-sm ring-1 ring-[#e6e9e1]">
                <CheckCircle2 size={17} className="text-[#6b936c]" /> One-to-one
                lessons
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 shadow-sm ring-1 ring-[#e6e9e1]">
                <CheckCircle2 size={17} className="text-[#6b936c]" /> Flexible
                time slots
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 shadow-sm ring-1 ring-[#e6e9e1]">
                <CheckCircle2 size={17} className="text-[#6b936c]" /> Online
                learning
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute -right-5 -top-7 h-40 w-40 rounded-full bg-[#dfe8d6] blur-3xl" />
            <div className="absolute -bottom-7 -left-7 h-44 w-44 rounded-full bg-[#ebd7b2] blur-3xl" />
            <div className="relative overflow-hidden rounded-[2.2rem] border border-[#dfeee1] bg-[#dfe9dd] p-3 shadow-[0_30px_50px_rgba(18,67,59,0.12)]">
              <div className="relative aspect-[5/4] overflow-hidden rounded-[1.8rem] bg-[linear-gradient(135deg,#9acc9d_0%,#7bc792_30%,#6ebd82_100%)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.12),transparent_22%)]" />
                <div className="absolute left-5 top-5 rounded-full border border-white/35 bg-white/20 px-3 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm">
                  Personal guidance
                </div>
                <div className="absolute left-5 top-16 max-w-[220px] text-[15px] font-semibold leading-tight text-white/90">
                  Easy way to learn Quran and Arabic online with tajweed.
                </div>

                <div className="absolute right-5 bottom-5 h-44 w-44 rounded-full border-[16px] border-[#bfe4c7] bg-[radial-gradient(circle_at_30%_30%,#f7d7a7_0%,#f0c07b_24%,#d99862_54%,#b66f42_100%)] shadow-[inset_8px_8px_0_rgba(255,255,255,0.12)]" />
                <div className="absolute right-12 bottom-10 h-24 w-20 rounded-[40%_40%_45%_45%] border-[10px] border-[#d8f4dc] bg-[#eafaf0] shadow-[inset_0_-10px_0_rgba(98,196,118,0.15)]" />
                <div className="absolute right-7 bottom-7 h-20 w-28 rounded-[50%_50%_48%_48%] bg-[#d3f0d4]" />
                <div className="absolute right-3 bottom-16 h-24 w-24 rounded-full bg-[#dceff4] opacity-80" />

                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/75">
                    Ana Quran
                  </p>
                  <p className="mt-2 max-w-[330px] text-2xl font-bold leading-tight tracking-[-0.04em]">
                    A meaningful learning journey starts with one lesson.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 text-center">
                <div className="rounded-2xl bg-white/90 px-2 py-3 shadow-sm ring-1 ring-[#e5ece1]">
                  <BookOpen className="mx-auto mb-1 text-[#6f8c69]" size={20} />
                  <p className="text-xs font-semibold text-[#34594b]">Quran</p>
                </div>
                <div className="rounded-2xl bg-white/90 px-2 py-3 shadow-sm ring-1 ring-[#e5ece1]">
                  <Languages className="mx-auto mb-1 text-[#6f8c69]" size={20} />
                  <p className="text-xs font-semibold text-[#34594b]">Arabic</p>
                </div>
                <div className="rounded-2xl bg-white/90 px-2 py-3 shadow-sm ring-1 ring-[#e5ece1]">
                  <GraduationCap className="mx-auto mb-1 text-[#6f8c69]" size={20} />
                  <p className="text-xs font-semibold text-[#34594b]">Islamic studies</p>
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
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e]">
            The Ana Quran approach
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#173b35] sm:text-4xl">
            Learning that fits your life
          </h2>
          <p className="mt-4 leading-7 text-[#6b7c73]">
            A supportive relationship with your teacher, a clear plan, and the
            flexibility to keep making progress.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-3xl border border-[#e5e9df] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf3e9] text-[#547a5d]">
                <Icon size={23} />
              </div>
              <h3 className="mt-5 text-xl font-bold text-[#23483c]">{title}</h3>
              <p className="mt-3 leading-7 text-[#6b7c73]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-[#eef3e9] py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e]">
                Getting started
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#173b35] sm:text-4xl">
                Simple steps. Personal progress.
              </h2>
              <p className="mt-5 leading-7 text-[#687b70]">
                From your first sign-up to your next lesson, we make it easy to
                stay connected and keep learning.
              </p>
              <Link
                href="/signup"
                className="mt-7 inline-flex items-center gap-2 font-semibold text-[#1d5144] hover:gap-3"
              >
                Create your student account <ArrowRight size={18} />
              </Link>
            </div>
            <div className="space-y-4">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="flex gap-5 rounded-2xl border border-[#dce6d8] bg-white p-6 shadow-sm"
                >
                  <span className="text-2xl font-bold text-[#b47b3c]">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-[#23483c]">
                      {step.title}
                    </h3>
                    <p className="mt-2 leading-7 text-[#6b7c73]">
                      {step.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
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

      <footer id="contact" className="border-t border-[#e5e9df] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-[#718078] md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="Ana Quran"
              width={96}
              height={96}
              className="h-12 w-12 md:h-14 md:w-14"
            />
            <span className="font-semibold text-[#23483c]">Ana Quran</span>
          </div>
          <p>Personal online learning in Quran, Arabic, and Islamic studies.</p>
          <div className="flex gap-5">
            <Link href="/contact" className="hover:text-[#1c5145]">
              Contact
            </Link>
            <Link href="/login" className="hover:text-[#1c5145]">
              Student login
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
