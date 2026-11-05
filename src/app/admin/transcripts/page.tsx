"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, PhoneCall, RefreshCw } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  getFlaggedLessons,
  getLessonTranscript,
} from "@/services/transcript.service";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";
import type { TranscriptFlag } from "@/types/transcript";

const display = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const flagLabel: Record<TranscriptFlag, string> = {
  phone: "Phone number",
  email: "Email address",
  platform: "Chat app",
  offplatform: "Off-platform",
};

const FlagBadge = ({ flag }: { flag: TranscriptFlag }) => (
  <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
    {flagLabel[flag] ?? flag}
  </span>
);

const offset = (seconds: number | null) => {
  if (seconds === null || Number.isNaN(seconds)) return null;
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, "0")}`;
};

export default function AdminTranscriptsPage() {
  const { role } = useAuth();
  const canManage = role === "admin" || role === "super_admin";
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const flaggedQuery = useQuery({
    queryKey: ["flagged-lessons"],
    queryFn: getFlaggedLessons,
    enabled: canManage,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });
  const transcriptQuery = useQuery({
    queryKey: ["lesson-transcript", selectedLessonId],
    queryFn: () => getLessonTranscript(selectedLessonId as string),
    enabled: canManage && selectedLessonId !== null,
  });

  if (!canManage) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Admin access is required to review transcripts.
      </main>
    );
  }

  const flagged = flaggedQuery.data ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <Link
            href="/admin/dashboard"
            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-400 mb-3 inline-block"
          >
            ← Back to admin dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">Lesson transcripts</h1>
          <p className="text-lg text-foreground opacity-75">
            Lessons where a participant shared a phone number, email, or chat
            handle, or asked to continue outside the academy.
          </p>
        </div>

        {flaggedQuery.isLoading ? (
          <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-10 text-center opacity-70">
            Loading flagged lessons…
          </div>
        ) : flaggedQuery.isError ? (
          <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-10 text-center">
            <p className="mb-4 opacity-70">
              Transcripts could not be loaded. Check the API connection and your
              permissions.
            </p>
            <button
              type="button"
              onClick={() => void flaggedQuery.refetch()}
              className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold hover:border-green-500"
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        ) : flagged.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-10 text-center opacity-70">
            No lessons have been flagged. Transcripts are stored once the
            transcription service is connected to the lesson room.
          </div>
        ) : selectedLessonId ? (
          <section>
            <button
              type="button"
              onClick={() => setSelectedLessonId(null)}
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-400"
            >
              <ArrowLeft size={16} /> All flagged lessons
            </button>

            {transcriptQuery.isLoading ? (
              <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-10 text-center opacity-70">
                Loading transcript…
              </div>
            ) : transcriptQuery.isError || !transcriptQuery.data ? (
              <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-10 text-center">
                <p className="mb-4 opacity-70">
                  This transcript could not be loaded.
                </p>
                <button
                  type="button"
                  onClick={() => void transcriptQuery.refetch()}
                  className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold hover:border-green-500"
                >
                  <RefreshCw size={16} /> Retry
                </button>
              </div>
            ) : (
              <>
                <header className="mb-6 rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
                  <p className="text-sm opacity-70">
                    {display(transcriptQuery.data.lesson.startsAt)} ·{" "}
                    {transcriptQuery.data.lesson.status}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">
                    {transcriptQuery.data.lesson.teacherName} with{" "}
                    {transcriptQuery.data.lesson.studentName}
                  </h2>
                  <p className="mt-2 text-sm opacity-70">
                    {transcriptQuery.data.segments.length} segments
                  </p>
                </header>

                <ol className="space-y-3">
                  {transcriptQuery.data.segments.map((segment) => {
                    const flaggedSegment = segment.flags.length > 0;
                    return (
                      <li
                        key={segment.id}
                        className={`rounded-2xl border p-4 ${
                          flaggedSegment
                            ? "border-amber-500/50 bg-amber-500/10"
                            : "border-card-border bg-card-bg"
                        }`}
                      >
                        <div className="mb-1 flex flex-wrap items-center gap-2 text-xs opacity-70">
                          <span className="font-semibold text-foreground opacity-100">
                            {segment.speaker}
                          </span>
                          {offset(segment.atSeconds) ? (
                            <span>{offset(segment.atSeconds)}</span>
                          ) : null}
                          {segment.flags.map((flag) => (
                            <FlagBadge key={flag} flag={flag} />
                          ))}
                        </div>
                        <p className="whitespace-pre-wrap text-sm">
                          {segment.text}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </>
            )}
          </section>
        ) : (
          <div className="space-y-4">
            {flagged.map((lesson) => (
              <button
                key={lesson.lessonId}
                type="button"
                onClick={() => setSelectedLessonId(lesson.lessonId)}
                className="w-full rounded-3xl border border-card-border bg-card-bg p-6 text-left transition hover:border-amber-500"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle
                      className="text-amber-500 dark:text-amber-400"
                      size={20}
                    />
                    <div>
                      <p className="font-semibold">
                        {lesson.teacherName ?? "Teacher"} with{" "}
                        {lesson.studentName ?? "Student"}
                      </p>
                      <p className="text-sm opacity-70">
                        {lesson.startsAt
                          ? display(lesson.startsAt)
                          : "Unknown time"}
                        {lesson.status ? ` · ${lesson.status}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <PhoneCall size={16} className="opacity-60" />
                    <span className="font-semibold">
                      {lesson.flaggedSegments} flagged
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {lesson.reasons.map((reason) => (
                    <FlagBadge key={reason} flag={reason} />
                  ))}
                  <span className="text-xs opacity-60">
                    Last seen {display(lesson.lastFlaggedAt)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
