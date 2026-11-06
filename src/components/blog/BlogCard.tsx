import Link from "next/link";
import { ArrowRight, BookOpen, Clock3 } from "lucide-react";

import { formatBlogDate, type BlogPost } from "@/lib/blog";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-[#e0e7da] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-card-border dark:bg-card-bg"
    >
      <div className="relative flex h-40 items-end overflow-hidden bg-[linear-gradient(135deg,#1d4e47_0%,#2a6355_100%)] p-6">
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
        <BookOpen
          className="absolute right-5 top-5 text-white/20"
          size={54}
          aria-hidden
        />
        <span className="relative rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold text-white">
          {post.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs font-medium text-[#7a8a80] dark:text-foreground/50">
          <Clock3 size={14} aria-hidden />
          {post.readingMinutes} min read
        </div>
        <h3 className="mt-3 text-xl font-bold leading-snug text-[#173b35] transition group-hover:text-[#1d5145] dark:text-foreground dark:group-hover:text-green-300">
          {post.title}
        </h3>
        <p className="mt-3 flex-1 leading-7 text-[#6b7c73] dark:text-foreground/70">
          {post.excerpt}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-[#e7eee3] pt-4 text-sm dark:border-card-border">
          <time dateTime={post.publishedAt} className="text-[#7a8a80] dark:text-foreground/50">
            {formatBlogDate(post.publishedAt)}
          </time>
          <span className="inline-flex items-center gap-1 font-semibold text-[#1d5145] dark:text-green-400">
            Read guide
            <ArrowRight
              size={16}
              className="transition group-hover:translate-x-1"
              aria-hidden
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
