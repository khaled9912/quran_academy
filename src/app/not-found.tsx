import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Compass, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

const links = [
  {
    href: "/",
    label: "Home",
    description: "Start from the beginning and see how lessons work.",
    icon: ArrowLeft,
  },
  {
    href: "/blog",
    label: "Quran learning guides",
    description: "Practical articles on Tajweed, memorization, and online study.",
    icon: BookOpen,
  },
  {
    href: "/about",
    label: "About the academy",
    description: "Where students learn from, fees, and common questions.",
    icon: Compass,
  },
  {
    href: "/contact",
    label: "Contact us",
    description: "Ask about lessons, scheduling, or your time zone.",
    icon: Mail,
  },
];

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f3efe8] px-5 pb-20 pt-28 text-[#173b35] dark:bg-background dark:text-foreground md:px-8 md:pt-36">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
          404
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[#123c35] dark:text-white sm:text-5xl">
          This page could not be found.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5d726a] dark:text-foreground/70">
          The link may be broken, or the page may have moved. These pages will
          help you continue.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {links.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-2xl border border-[#dfe7d9] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-card-border dark:bg-card-bg"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3e9] text-[#547a5d] dark:bg-green-500/15 dark:text-green-300">
                <Icon size={20} aria-hidden />
              </div>
              <h2 className="mt-4 font-bold text-[#23483c] transition group-hover:text-[#1d5145] dark:text-foreground dark:group-hover:text-green-300">
                {label}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#6b7c73] dark:text-foreground/70">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
