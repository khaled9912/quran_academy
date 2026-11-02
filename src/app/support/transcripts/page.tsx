"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ClipboardList, RefreshCw } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { getReviewQueue } from "@/services/review.service";
import type { ReviewQueueFilter, ReviewStatus } from "@/types/review";
import type { TranscriptFlag } from "@/types/transcript";

const display = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const flagLabel: Record<TranscriptFlag, string> = {
  phone: "Phone number",
  email: "Email address",
  platform: "Chat app",
  offplatform: "Off-platform",
};

const flagBadge = (flag: TranscriptFlag) => (
  <span
    key={flag}
    className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400"
  >
    {flagLabel[flag] ?? flag}
  </span>
);

const filters: Array<{ value: ReviewQueueFilter; label: string }> = [
  { value: "unreviewed", label: "Needs review" },
  { value: "draft", label: "Drafts" },
  { value: "submitted", label: "Submitted" },
  { value: "flagged", label: "Flagged" },
  { value: "all", label: "All" },
];

const reviewBadge = (
  status: ReviewStatus | null,
  average: number | null,
  updatedAt: string | null
) => {
  if (!status)
    return (
      <span className="rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
        Not reviewed
      </span>
    );
  const styles =
    status === "submitted"
      ? "bg-green-500/15 text-green-700"
      : "bg-amber-500/15 text-amber-700";
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}
      >
        {status === "submitted" ? "Submitted" : "Draft"}
      </span>
      {average !== null ? (
        <span className="text-xs opacity-70">{average.toFixed(1)} / 5</span>
      ) : null}
      {updatedAt ? (
        <span className="text-xs opacity-60">
          updated {new Date(updatedAt).toLocaleDateString()}
        </span>
      ) : null}
    </span>
  );
};

export default function SupportReviewQueuePage() {
  const { role } = useAuth();
  const canReview =
    role === "support" || role === "admin" || role === "super_admin";
  const [filter, setFilter] = useState<ReviewQueueFilter>("unreviewed");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const queueQuery = useQuery({
    queryKey: ["review-queue", filter, from, to],
    queryFn: () =>
      getReviewQueue({
        status: filter,
        from: from ? `${from}T00:00:00Z` : undefined,
        to: to ? `${to}T00:00:00Z` : undefined,
      }),
    enabled: canReview,
  });

  if (!canReview) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Support or admin access is required to review lessons.
      </main>
    );
  }

  const lessons = queueQuery.data ?? [];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 text-foreground">
      <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Lesson review queue</h1>
          <p className="text-lg text-foreground opacity-75">
            Read the transcript, score the lesson and record the gaps the
            teacher and student should work on. Flagged lessons come first.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  filter === item.value
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-card-border bg-card-bg hover:border-green-500"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-3 text-sm">
            <label className="flex flex-col gap-1">
              <span className="opacity-70">From</span>
              <input
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="rounded-xl border border-card-border bg-background px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="opacity-70">To</span>
              <input
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="rounded-xl border border-card-border bg-background px-3 py-2"
              />
            </label>
          </div>
        </div>

        {queueQuery.isLoading ? (
          <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-10 text-center opacity-70">
            Loading the review queue…
          </div>
        ) : queueQuery.isError ? (
          <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-10 text-center">
            <p className="mb-4 opacity-70">
              The queue could not be loaded. Check the API connection and your
              permissions.
            </p>
            <button
              type="button"
              onClick={() => void queueQuery.refetch()}
              className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold hover:border-green-500"
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        ) : lessons.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-10 text-center opacity-70">
            {filter === "unreviewed"
              ? "Nothing waiting for review in this range."
              : "No lessons match this filter."}
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <Link
                key={lesson.lessonId}
                href={`/support/transcripts/${lesson.lessonId}`}
                className={`block rounded-3xl border bg-card-bg p-6 transition hover:border-green-500 ${
                  lesson.flaggedSegments > 0
                    ? "border-amber-500/50"
                    : "border-card-border"
                }`}
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {lesson.teacherName} with {lesson.studentName}
                    </p>
                    <p className="text-sm opacity-70">
                      {display(lesson.startsAt)} · {lesson.lessonStatus}
                    </p>
                  </div>
                  {reviewBadge(
                    lesson.reviewStatus,
                    lesson.reviewAverage,
                    lesson.reviewUpdatedAt
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs opacity-70">
                  <span className="inline-flex items-center gap-1.5">
                    <ClipboardList size={14} />
                    {lesson.segments} segments
                  </span>
                  {lesson.flaggedSegments > 0 ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
                      <AlertTriangle size={14} />
                      {lesson.flaggedSegments} flagged
                    </span>
                  ) : null}
                  {lesson.reviewerName ? (
                    <span>reviewed by {lesson.reviewerName}</span>
                  ) : null}
                </div>
                {lesson.flagReasons.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {lesson.flagReasons.map(flagBadge)}
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
