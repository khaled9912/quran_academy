import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Clock3 } from "lucide-react";

import { BlogCard } from "@/components/blog/BlogCard";
import { ArticleReader } from "@/components/blog/ArticleReader";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { EnrolCta } from "@/components/EnrolCta";
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
        <header className="relative overflow-hidden rounded-[2rem] border border-[#e0e7da] bg-white p-7 shadow-sm dark:border-card-border dark:bg-card-bg md:p-10">
          <svg
            aria-hidden
            viewBox="0 0 200 200"
            className="float-slow pointer-events-none absolute -right-8 -top-10 h-44 w-44 text-[#1d4e47]/10 dark:text-green-300/10"
            fill="currentColor"
          >
            <path d="M140 20a80 80 0 1 0 40 140 90 90 0 0 1-40-140z" />
            <path d="M160 60l6 14 14 6-14 6-6 14-6-14-14-6 14-6z" />
          </svg>
          <div className="breathe pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-[#e4c18e]/15 dark:bg-amber-300/10" />
          <span className="relative inline-flex rounded-full bg-[#edf3e9] px-3 py-1 text-xs font-semibold text-[#4d7058] dark:bg-green-500/15 dark:text-green-300">
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

        <ArticleReader post={post} />

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
                <EnrolCta
                  label="Start with a free trial"
                  withArrow={false}
                  className="rounded-xl bg-[#e4c18e] px-5 py-3 text-center text-sm font-semibold text-[#24483b] transition hover:bg-[#efd1a4]"
                />
                <Link
                  href="/contact"
                  className="rounded-xl border border-white/30 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Ask a question
                </Link>
              </div>
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
