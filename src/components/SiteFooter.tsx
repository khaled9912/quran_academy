import Link from "next/link";

import { sortedBlogPosts } from "@/lib/blog";

const COURSE_LINKS = [
  { href: "/courses", label: "All courses" },
  { href: "/courses/quran-for-kids", label: "Quran for kids" },
  { href: "/plans", label: "Plans and pricing" },
];

const ACADEMY_LINKS = [
  { href: "/about", label: "About us" },
  { href: "/teach", label: "Teach with us" },
  { href: "/contact", label: "Contact" },
];

const ACCOUNT_LINKS = [
  { href: "/signup", label: "Create an account" },
  { href: "/login", label: "Student login" },
];

const COLUMN_LINK_CLASS =
  "text-sm leading-6 text-[#718078] transition hover:text-[#1c5145] dark:text-foreground/60 dark:hover:text-green-400";

function FooterColumn({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <nav aria-label={heading}>
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#a7773e] dark:text-amber-300">
        {heading}
      </p>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </nav>
  );
}

export function SiteFooter() {
  const posts = sortedBlogPosts();

  return (
    <footer className="border-t border-[#e5e9df] bg-white dark:border-card-border dark:bg-card-bg">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)] md:gap-8">
          <div>
            <Link href="/" aria-label="Ana Quran Academy home">
              <img
                src="/logo-ana-quran.svg?v=2026-11-06-1"
                alt="Ana Quran Academy"
                width={57}
                height={80}
                className="h-16 w-auto dark:hidden"
              />
              <img
                src="/logo-ana-quran-light.svg?v=2026-11-06-1"
                alt="Ana Quran Academy"
                width={57}
                height={80}
                className="hidden h-16 w-auto dark:block"
              />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-[#718078] dark:text-foreground/60">
              One-to-one online Quran, Tajweed, memorization, Arabic, and
              Islamic studies for English-speaking students worldwide. Lessons
              are scheduled in your own time zone.
            </p>
          </div>

          <FooterColumn heading="Courses">
            {COURSE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={COLUMN_LINK_CLASS}>
                  {link.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn heading="Guides">
            <li>
              <Link href="/blog" className={COLUMN_LINK_CLASS}>
                All guides
              </Link>
            </li>
            {posts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className={COLUMN_LINK_CLASS}>
                  {post.seoTitle}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn heading="Academy">
            {ACADEMY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={COLUMN_LINK_CLASS}>
                  {link.label}
                </Link>
              </li>
            ))}
            {ACCOUNT_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={COLUMN_LINK_CLASS}>
                  {link.label}
                </Link>
              </li>
            ))}
          </FooterColumn>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[#e7eee3] pt-6 text-xs text-[#7a8a80] dark:border-card-border dark:text-foreground/50 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Ana Quran Academy.</p>
          <p>English-speaking students worldwide, wherever they live.</p>
        </div>
      </div>
    </footer>
  );
}
