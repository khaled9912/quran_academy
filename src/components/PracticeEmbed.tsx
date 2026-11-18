import Link from "next/link";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";

export function PracticeEmbed({ backHref }: { backHref: string }) {
  return (
    <div className="flex h-screen flex-col bg-background pt-8 text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border px-4 py-3 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={backHref}
            aria-label="Back to dashboard"
            className="rounded-lg border border-card-border p-2 transition hover:border-green-500"
          >
            <ArrowLeft size={16} />
          </Link>
          <BookOpen
            size={20}
            className="shrink-0 text-green-600 dark:text-green-400"
          />
          <h1 className="truncate text-lg font-semibold">
            Noor Al-Bayan practice
          </h1>
        </div>
        <a
          href="/nur-albayan/index.html"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm font-semibold transition hover:border-green-500"
        >
          Open full screen <ExternalLink size={14} />
        </a>
      </div>
      <iframe
        src="/nur-albayan/index.html"
        title="Noor Al-Bayan interactive lessons"
        className="w-full flex-1 border-0"
        allow="autoplay; fullscreen"
      />
    </div>
  );
}