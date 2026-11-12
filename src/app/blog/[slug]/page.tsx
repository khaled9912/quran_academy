import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Clock3 } from "lucide-react";

import { BlogCard } from "@/components/blog/BlogCard";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import {
  BLOG_AUTHOR,
  formatBlogDate,
  getBlogPost,
  relatedBlogPosts,
  sortedBlogPosts,
} from "@/lib/blog";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return sortedBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Article not found",
      robots: { index: false, follow: false },
    };
  }

  const url = absoluteUrl(`/blog/${post.slug}`);
  const image = absoluteUrl(`/blog/${post.slug}/opengraph-image`);

  return {
    title: post.seoTitle,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `/blog/${post.slug}`,
      types: { "application/rss+xml": "/blog/rss.xml" },
    },
    openGraph: {
      type: "article",
      url,
      siteName: SITE_NAME,
      title: post.title,
      description: post.description,
      publishedTime: `${post.publishedAt}T00:00:00Z`,
      modifiedTime: `${post.updatedAt}T00:00:00Z`,
      authors: [BLOG_AUTHOR],
      tags: post.keywords,
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [image],
    },
  };
}

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

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const url = absoluteUrl(`/blog/${post.slug}`);
  const related = relatedBlogPosts(post.slug, 4);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: "en",
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    image: absoluteUrl(`/blog/${post.slug}/opengraph-image`),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: post.category,
    keywords: post.keywords.join(", "),
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
        name: "Blog",
        item: absoluteUrl("/blog"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: url,
      },
    ],
  };

  return (
    <main className="overflow-hidden bg-[#f3efe8] text-[#173b35] dark:bg-background dark:text-foreground">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      <div className="mx-auto max-w-4xl px-5 pt-28 md:px-8 md:pt-36">
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
                href="/blog"
                className="hover:text-[#1d5145] dark:hover:text-green-400"
              >
                Blog
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li
              aria-current="page"
              className="text-[#4f675c] dark:text-foreground/70"
            >
              {post.category}
            </li>
          </ol>
        </nav>
      </div>

      <article className="mx-auto max-w-4xl px-5 pb-16 pt-8 md:px-8 md:pb-20">
        <header className="rounded-[2rem] border border-[#e0e7da] bg-white p-7 shadow-sm dark:border-card-border dark:bg-card-bg md:p-10">
          <span className="inline-flex rounded-full bg-[#edf3e9] px-3 py-1 text-xs font-semibold text-[#4d7058] dark:bg-green-500/15 dark:text-green-300">
            {post.category}
          </span>
          <h1 className="mt-5 text-3xl font-black leading-[1.12] tracking-[-0.03em] text-[#123c35] dark:text-white sm:text-4xl md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#5d726a] dark:text-foreground/70">
            {post.description}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#e7eee3] pt-5 text-sm text-[#7a8a80] dark:border-card-border dark:text-foreground/50">
            <span>{BLOG_AUTHOR}</span>
            <span aria-hidden>•</span>
            <time dateTime={post.publishedAt}>
              {formatBlogDate(post.publishedAt)}
            </time>
            <span aria-hidden>•</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={15} aria-hidden />
              {post.readingMinutes} min read
            </span>
          </div>
        </header>

        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_220px] md:items-start">
          <div className="min-w-0">
            <div className="space-y-5 text-lg leading-8 text-[#4f675c] dark:text-foreground/75">
              {post.intro.map((paragraph) => (
                <p key={paragraph}>
                  <InlineText text={paragraph} />
                </p>
              ))}
            </div>

            {post.sections.map((section) => {
              const id = slugify(section.heading);

              return (
                <section key={section.heading} className="mt-10">
                  <h2
                    id={id}
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
                  {section.list && (
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
                  )}
                  {section.note && (
                    <p className="mt-5 rounded-2xl border border-[#e7d8bd] bg-[#fbf5e9] p-5 leading-7 text-[#6d5738] dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100">
                      <InlineText text={section.note} />
                    </p>
                  )}
                </section>
              );
            })}

            <div className="mt-12 rounded-3xl bg-[#1c5145] p-7 text-white md:p-9">
              <div className="flex items-center gap-3">
                <BookOpen size={24} className="text-[#e4c18e]" aria-hidden />
                <h2 className="text-2xl font-bold">Learn with a teacher</h2>
              </div>
              <p className="mt-3 leading-7 text-white/75">
                Ana Quran Academy teaches Quran, Tajweed, memorization, Arabic,
                and Islamic studies one-to-one in English. New students begin
                with a free trial lesson.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="rounded-xl bg-[#e4c18e] px-5 py-3 text-center text-sm font-semibold text-[#24483b] transition hover:bg-[#efd1a4]"
                >
                  Start with a free trial
                </Link>
                <Link
                  href="/contact"
                  className="rounded-xl border border-white/30 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Ask a question
                </Link>
              </div>
            </div>
          </div>

          <nav
            aria-label="In this guide"
            className="hidden rounded-2xl border border-[#e0e7da] bg-white p-5 text-sm dark:border-card-border dark:bg-card-bg md:sticky md:top-28 md:block"
          >
            <p className="font-semibold text-[#23483c] dark:text-foreground">
              In this guide
            </p>
            <ul className="mt-3 space-y-2.5 text-[#6b7c73] dark:text-foreground/60">
              {post.sections.map((section) => (
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

        <div className="mt-12 border-t border-[#e2e8dc] pt-8 dark:border-card-border">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1d5145] transition hover:gap-3 dark:text-green-400"
          >
            <ArrowLeft size={16} aria-hidden />
            All Quran learning guides
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-[#e2e8dc] bg-[#eef3e9] py-14 dark:border-card-border dark:bg-[#16324a] md:py-20">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a7773e] dark:text-amber-300">
                  Keep reading
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#173b35] dark:text-foreground">
                  Related guides
                </h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#1d5145] hover:gap-3 dark:text-green-400"
              >
                Visit the blog <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((relatedPost) => (
                <BlogCard key={relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      )}
      <SiteFooter />
    </main>
  );
}
