"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import type { BlogPost, BlogSection } from "@/lib/blog";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);

  return (
    <>
      {parts.map((part, index) => {
        const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (!match) return <span key={index}>{part}</span>;

        return (
          <Link
            key={index}
            href={match[2]}
            className="font-semibold text-[#1d5145] underline decoration-[#b9cfc2] underline-offset-4 transition hover:decoration-[#1d5145] dark:text-green-400 dark:decoration-green-400/40 dark:hover:decoration-green-400"
          >
            {match[1]}
          </Link>
        );
      })}
    </>
  );
}

function SectionBody({
  section,
  index,
  kids,
}: {
  section: BlogSection;
  index: number;
  kids: boolean;
}) {
  const accent = kids
    ? "bg-amber-400/20 text-amber-700 dark:bg-amber-300/15 dark:text-amber-300"
    : "bg-[#edf3e9] text-[#4d7058] dark:bg-green-500/15 dark:text-green-300";

  return (
    <section
      className="rise-in mt-10"
      style={{ animationDelay: `${Math.min(index * 70, 350)}ms` }}
    >
      <h2
        id={slugify(section.heading)}
        className="scroll-mt-28 text-2xl font-bold leading-snug text-[#173b35] dark:text-foreground"
      >
        {section.heading}
      </h2>
      <div className="mt-4 space-y-4 leading-8 text-[#5d726a] dark:text-foreground/70">
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph}>
            <InlineText text={paragraph} />
          </p>
        ))}
      </div>
      {section.list && section.listStyle === "steps" ? (
        <ol className="mt-5 space-y-3">
          {section.list.map((item, stepIndex) => (
            <li
              key={item}
              className="pop-in flex items-start gap-4 rounded-2xl border border-[#e0e7da] bg-white p-4 shadow-sm dark:border-card-border dark:bg-card-bg"
              style={{ animationDelay: `${Math.min(stepIndex * 60, 420)}ms` }}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${accent}`}
              >
                {stepIndex + 1}
              </span>
              <span className="leading-7 text-[#5d726a] dark:text-foreground/70">
                <InlineText text={item} />
              </span>
            </li>
          ))}
        </ol>
      ) : section.list ? (
        <ul className="mt-4 space-y-3 pl-5 text-[#5d726a] dark:text-foreground/70">
          {section.list.map((item) => (
            <li
              key={item}
              className="list-disc leading-7 marker:text-[#8ab57d]"
            >
              <InlineText text={item} />
            </li>
          ))}
        </ul>
      ) : null}
      {section.note && (
        <p className="mt-5 rounded-2xl border border-[#e7d8bd] bg-[#fbf5e9] p-5 leading-7 text-[#6d5738] dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100">
          <InlineText text={section.note} />
        </p>
      )}
    </section>
  );
}

export function ArticleReader({ post }: { post: BlogPost }) {
  const [level, setLevel] = useState<"kids" | "teens">(
    post.defaultLevel ?? "teens"
  );
  const kids = level === "kids" && Boolean(post.kids);
  const active = kids ? post.kids! : { intro: post.intro, sections: post.sections };

  return (
    <div className="mt-10">
      {post.kids && (
        <div className="rise-in flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#7a8a80] dark:text-foreground/60">
            <Sparkles size={15} aria-hidden />
            Reading level
          </span>
          <div
            role="group"
            aria-label="Choose a reading level"
            className="inline-flex rounded-full border border-[#d8e2d2] bg-white p-1 shadow-sm dark:border-card-border dark:bg-card-bg"
          >
            <button
              type="button"
              aria-pressed={kids}
              onClick={() => setLevel("kids")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${kids ? "bg-amber-400 text-[#4a3208] shadow-sm" : "text-[#6b7c73] hover:text-[#173b35] dark:text-foreground/60 dark:hover:text-foreground"}`}
            >
              For kids
            </button>
            <button
              type="button"
              aria-pressed={!kids}
              onClick={() => setLevel("teens")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${!kids ? "bg-[#1d4e47] text-white shadow-sm dark:bg-green-600" : "text-[#6b7c73] hover:text-[#173b35] dark:text-foreground/60 dark:hover:text-foreground"}`}
            >
              Ages 13+
            </button>
          </div>
          <span className="text-xs text-[#7a8a80] dark:text-foreground/50">
            {kids
              ? "Short sentences and a try-it activity in every guide."
              : "Deeper context with Quran references."}
          </span>
        </div>
      )}

      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_220px] md:items-start">
        <div key={level} className="min-w-0">
          <div className="space-y-5 text-lg leading-8 text-[#4f675c] dark:text-foreground/75">
            {active.intro.map((paragraph, index) => (
              <p
                key={paragraph}
                className="rise-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <InlineText text={paragraph} />
              </p>
            ))}
          </div>

          {active.sections.map((section, index) => (
            <SectionBody
              key={section.heading}
              section={section}
              index={index}
              kids={kids}
            />
          ))}
        </div>

        <nav
          aria-label="In this guide"
          className="hidden rounded-2xl border border-[#e0e7da] bg-white p-5 text-sm dark:border-card-border dark:bg-card-bg md:sticky md:top-28 md:block"
        >
          <p className="font-semibold text-[#23483c] dark:text-foreground">
            In this guide
          </p>
          <ul className="mt-3 space-y-2.5 text-[#6b7c73] dark:text-foreground/60">
            {active.sections.map((section) => (
              <li key={section.heading}>
                <a
                  href={`#${slugify(section.heading)}`}
                  className="leading-snug transition hover:text-[#1d5145] dark:hover:text-green-400"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}