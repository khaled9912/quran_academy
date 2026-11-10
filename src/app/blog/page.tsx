import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock3 } from "lucide-react";

import { BlogCard } from "@/components/blog/BlogCard";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { formatBlogDate, sortedBlogPosts, type BlogPost } from "@/lib/blog";
import { absoluteUrl, pageMetadata, SITE_URL } from "@/lib/seo";

const posts = sortedBlogPosts();
const featured = posts[0];
const remaining = posts.slice(1);

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Learn Quran Online: Guides for English Speakers",
    description:
      "Practical guides on learning Quran online, Tajweed, memorization, and choosing an online Quran academy for English-speaking students worldwide.",
    path: "/blog",
    image: "/blog/opengraph-image",
    imageAlt: "Ana Quran Academy Blog — Quran learning guides",
    keywords: [
      "learn Quran online",
      "online Quran classes",
      "learn Quran with Tajweed",
      "Quran memorization online",
      "online Quran classes for kids",
      "online Quran academy for English speakers",
    ],
  }),
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
};

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${SITE_URL}/blog#blog`,
  name: "Ana Quran Academy Blog",
  description:
    "Practical Quran learning guides for English-speaking students worldwide.",
  url: absoluteUrl("/blog"),
  inLanguage: "en",
  publisher: { "@id": `${SITE_URL}/#organization` },
  blogPost: posts.map((post) => ({
    "@type": "BlogPosting",
    "@id": `${absoluteUrl(`/blog/${post.slug}`)}#article`,
    headline: post.title,
    url: absoluteUrl(`/blog/${post.slug}`),
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    articleSection: post.category,
  })),
};

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid overflow-hidden rounded-[2rem] border border-[#e0e7da] bg-white shadow-sm transition hover:shadow-xl dark:border-card-border dark:bg-card-bg md:grid-cols-2"
    >
      <div className="relative flex min-h-[260px] flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,#173f39_0%,#1d4e47_55%,#2a6355_100%)] p-8 text-white md:p-10">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[#e4c18e]/10" />
        <div className="relative flex items-center justify-between gap-4">
          <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold">
            Latest guide
          </span>
          <BookOpen className="text-white/25" size={42} aria-hidden />
        </div>
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d8c29f]">
            {post.category}
          </p>
          <h2 className="mt-3 max-w-md text-2xl font-bold leading-tight sm:text-3xl">
            {post.title}
          </h2>
        </div>
      </div>
      <div className="flex flex-col p-8 md:p-10">
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#7a8a80] dark:text-foreground/50">
          <time dateTime={post.publishedAt}>
            {formatBlogDate(post.publishedAt)}
          </time>
          <span aria-hidden>•</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={14} aria-hidden />
            {post.readingMinutes} min read
          </span>
        </div>
        <p className="mt-4 leading-8 text-[#5d726a] dark:text-foreground/70">
          {post.excerpt}
        </p>
        <span className="mt-auto inline-flex items-center gap-2 pt-6 font-semibold text-[#1d5145] dark:text-green-400">
          Read the guide
          <ArrowRight
            size={18}
            className="transition group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  return (
    <main className="overflow-hidden bg-[#f3efe8] text-[#173b35] dark:bg-background dark:text-foreground">
      <JsonLd data={blogSchema} />

      <section className="relative isolate border-b border-[#e2e8dc] dark:border-card-border">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_10%,rgba(206,224,197,0.42),transparent_32%),linear-gradient(135deg,#f3efe8_0%,#eef3e9_100%)] dark:bg-[radial-gradient(circle_at_85%_10%,rgba(124,167,130,0.18),transparent_32%),linear-gradient(135deg,#162f45_0%,#1a3a52_100%)]" />
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-28 md:px-8 md:pb-20 md:pt-36">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
            Quran learning blog
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[#123c35] dark:text-white sm:text-5xl md:text-6xl">
            Practical guides for learning Quran online.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5d726a] dark:text-foreground/70">
            Clear, practical articles for English-speaking students and parents,
            wherever you live. Learn how online lessons work, what Tajweed study
            involves, and how to build a memorization routine that lasts.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        {featured && <FeaturedPost post={featured} />}

        {remaining.length > 0 && (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {remaining.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        <div className="mt-14 rounded-3xl border border-[#dfe7d9] bg-white p-8 text-center shadow-sm dark:border-card-border dark:bg-card-bg md:p-10">
          <h2 className="text-2xl font-bold text-[#173b35] dark:text-foreground">
            Ready to start learning?
          </h2>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-[#6b7c73] dark:text-foreground/70">
            Read about the academy, meet our teachers, or ask a question about
            lessons and scheduling in your time zone.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="registration-cta rounded-xl bg-[#1d4e47] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173f39] dark:bg-green-600 dark:hover:bg-green-500"
            >
              Start with a free trial
            </Link>
            <Link
              href="/about"
              className="rounded-xl border border-[#cedacd] px-5 py-3 text-sm font-semibold text-[#244c40] transition hover:bg-[#f3efe8] dark:border-[#3a5a7a] dark:text-foreground dark:hover:bg-white/10"
            >
              About the academy
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
