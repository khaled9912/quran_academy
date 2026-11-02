"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Flag,
  RefreshCw,
  Save,
  Send,
  Users,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  getReviewWorkspace,
  saveQualityReview,
} from "@/services/review.service";
import type {
  LessonQualityReview,
  ReviewInput,
  ReviewMetrics,
  ReviewStatus,
} from "@/types/review";
import type { TranscriptFlag } from "@/types/transcript";

const display = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const flagLabel: Record<TranscriptFlag, string> = {
  phone: "Phone number",
  email: "Email address",
  platform: "Chat app",
  offplatform: "Off-platform",
};

const offset = (seconds: number | null) => {
  if (seconds === null || Number.isNaN(seconds)) return null;
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, "0")}`;
};

const duration = (seconds: number | null) => {
  if (seconds === null) return "Unknown";
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  return `${minutes}m ${String(total % 60).padStart(2, "0")}s`;
};

const scoreLabels = [
  {
    key: "teachingClarity",
    label: "Teaching clarity",
    hint: "Was the explanation clear and at the student's level?",
  },
  {
    key: "studentPractice",
    label: "Student practice",
    hint: "Did the student recite or answer enough of the lesson?",
  },
  {
    key: "correctionQuality",
    label: "Correction quality",
    hint: "Were mistakes corrected accurately and kindly?",
  },
  {
    key: "engagement",
    label: "Engagement",
    hint: "Was the student attentive, responsive and encouraged?",
  },
] as const;

type ScoreKey = (typeof scoreLabels)[number]["key"];

const metricCard = (label: string, value: string, icon: React.ReactNode) => (
  <div className="rounded-2xl border border-card-border bg-card-bg p-4">
    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide opacity-60">
      {icon}
      {label}
    </div>
    <p className="text-xl font-semibold">{value}</p>
  </div>
);

function TalkBalance({ metrics }: { metrics: ReviewMetrics }) {
  const teacher = metrics.teacherTalkPercent;
  const student = metrics.studentTalkPercent;
  return (
    <div className="rounded-2xl border border-card-border bg-card-bg p-4 md:col-span-2">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide opacity-60">
        <Users size={14} />
        Talk balance (estimated from word count)
      </div>
      {teacher === null || student === null ? (
        <p className="text-sm opacity-70">
          Speaker labels were not recognised, so talk time could not be
          estimated.
        </p>
      ) : (
        <>
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-semibold">Teacher {teacher}%</span>
            <span className="font-semibold">Student {student}%</span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-slate-500/20">
            <div
              className="bg-green-600"
              style={{ width: `${teacher}%` }}
              aria-hidden
            />
            <div
              className="bg-emerald-400"
              style={{ width: `${student}%` }}
              aria-hidden
            />
          </div>
          <p className="mt-2 text-xs opacity-60">
            A rough balance signal, not a clock. Recitation quality is never
            judged automatically.
          </p>
        </>
      )}
    </div>
  );
}

function ScoreRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-card-border p-4">
      <p className="font-semibold">{label}</p>
      <p className="mb-3 text-xs opacity-60">{hint}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            aria-pressed={value === score}
            onClick={() => onChange(score)}
            className={`h-10 w-10 rounded-xl border text-sm font-semibold transition ${
              value === score
                ? "border-green-600 bg-green-600 text-white"
                : "border-card-border bg-background hover:border-green-500"
            }`}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewForm({
  lessonId,
  review,
  onSaved,
}: {
  lessonId: string;
  review: LessonQualityReview | null;
  onSaved: (status: ReviewStatus) => void;
}) {
  const queryClient = useQueryClient();
  const [scores, setScores] = useState<Record<ScoreKey, number | null>>({
    teachingClarity: review?.teachingClarity ?? null,
    studentPractice: review?.studentPractice ?? null,
    correctionQuality: review?.correctionQuality ?? null,
    engagement: review?.engagement ?? null,
  });
  const [strengths, setStrengths] = useState(review?.strengths ?? "");
  const [gaps, setGaps] = useState(review?.gaps ?? "");
  const [teacherAction, setTeacherAction] = useState(
    review?.teacherAction ?? ""
  );
  const [studentAction, setStudentAction] = useState(
    review?.studentAction ?? ""
  );
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (status: ReviewStatus) => {
      const input: ReviewInput = {
        ...scores,
        strengths: strengths.trim() || null,
        gaps: gaps.trim() || null,
        teacherAction: teacherAction.trim() || null,
        studentAction: studentAction.trim() || null,
        status,
      };
      return saveQualityReview(lessonId, input);
    },
    onSuccess: async (_, status) => {
      setError("");
      await queryClient.invalidateQueries({
        queryKey: ["review-workspace", lessonId],
      });
      await queryClient.invalidateQueries({ queryKey: ["review-queue"] });
      await queryClient.invalidateQueries({ queryKey: ["review-digest"] });
      onSaved(status);
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "The review could not be saved."
      );
    },
  });

  const handleSave = (status: ReviewStatus) => {
    setError("");
    if (status === "submitted") {
      if (Object.values(scores).some((value) => value === null)) {
        setError("Score all four areas before submitting.");
        return;
      }
      if (gaps.trim().length < 3) {
        setError("Describe at least one gap before submitting.");
        return;
      }
    }
    mutation.mutate(status);
  };

  return (
    <section className="rounded-3xl border border-card-border bg-card-bg p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Review rubric</h2>
        {review ? (
          <span className="text-xs opacity-60">
            {review.status === "submitted" ? "Submitted" : "Draft"}
            {review.reviewerName ? ` · ${review.reviewerName}` : ""}
          </span>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {scoreLabels.map((item) => (
          <ScoreRow
            key={item.key}
            label={item.label}
            hint={item.hint}
            value={scores[item.key]}
            onChange={(value) =>
              setScores((current) => ({ ...current, [item.key]: value }))
            }
          />
        ))}
      </div>

      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">
            What went well
          </span>
          <textarea
            value={strengths}
            onChange={(event) => setStrengths(event.target.value)}
            rows={3}
            maxLength={2000}
            className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm focus:border-green-500 focus:outline-none"
            placeholder="Keep this short and specific so the teacher can repeat it."
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">
            Gaps to work on <span className="text-red-500">*</span>
          </span>
          <textarea
            value={gaps}
            onChange={(event) => setGaps(event.target.value)}
            rows={4}
            maxLength={2000}
            className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm focus:border-green-500 focus:outline-none"
            placeholder="Required to submit. e.g. Student pauses on madd before a hamza; teacher does not revisit the previous week's surah."
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">
            Teacher action for next lesson
          </span>
          <textarea
            value={teacherAction}
            onChange={(event) => setTeacherAction(event.target.value)}
            rows={2}
            maxLength={1000}
            className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm focus:border-green-500 focus:outline-none"
            placeholder="One concrete change the teacher can make."
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">
            Student action for this week
          </span>
          <textarea
            value={studentAction}
            onChange={(event) => setStudentAction(event.target.value)}
            rows={2}
            maxLength={1000}
            className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm focus:border-green-500 focus:outline-none"
            placeholder="What the student should practise before the next lesson."
          />
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={mutation.isPending}
          onClick={() => handleSave("draft")}
          className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-background px-4 py-2.5 text-sm font-semibold hover:border-green-500 disabled:opacity-60"
        >
          <Save size={16} /> Save draft
        </button>
        <button
          type="button"
          disabled={mutation.isPending}
          onClick={() => handleSave("submitted")}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
        >
          <Send size={16} /> Submit review
        </button>
      </div>
    </section>
  );
}

export default function SupportLessonReviewPage() {
  const { role } = useAuth();
  const canReview =
    role === "support" || role === "admin" || role === "super_admin";
  const params = useParams<{ id: string }>();
  const lessonId = params?.id ?? "";
  const [notice, setNotice] = useState("");

  const workspaceQuery = useQuery({
    queryKey: ["review-workspace", lessonId],
    queryFn: () => getReviewWorkspace(lessonId),
    enabled: canReview && lessonId.length > 0,
  });

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  if (!canReview) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Support or admin access is required to review lessons.
      </main>
    );
  }

  const workspace = workspaceQuery.data;

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 text-foreground">
      <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-16">
        <Link
          href="/support/transcripts"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700"
        >
          <ArrowLeft size={16} /> Review queue
        </Link>

        {workspaceQuery.isLoading ? (
          <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-10 text-center opacity-70">
            Loading the lesson and transcript…
          </div>
        ) : workspaceQuery.isError || !workspace ? (
          <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-10 text-center">
            <p className="mb-4 opacity-70">
              The lesson could not be loaded. It may belong to another academy
              or the transcript is missing.
            </p>
            <button
              type="button"
              onClick={() => void workspaceQuery.refetch()}
              className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold hover:border-green-500"
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        ) : (
          <>
            <header className="mb-6 rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
              <p className="text-sm opacity-70">
                {display(workspace.lesson.startsAt)} · {workspace.lesson.status}
              </p>
              <h1 className="mt-1 text-3xl font-bold">
                {workspace.lesson.teacherName} with{" "}
                {workspace.lesson.studentName}
              </h1>
              {workspace.metrics.flaggedSegments > 0 ? (
                <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-700 dark:text-amber-400">
                  <AlertTriangle size={15} />
                  {workspace.metrics.flaggedSegments} flagged segment
                  {workspace.metrics.flaggedSegments === 1 ? "" : "s"}:
                  {workspace.metrics.flagReasons
                    .map((flag) => flagLabel[flag] ?? flag)
                    .join(", ")}
                </p>
              ) : null}
            </header>

            {notice ? (
              <p className="mb-5 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-700">
                {notice}
              </p>
            ) : null}

            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {metricCard(
                "Transcript segments",
                String(workspace.metrics.segments),
                <Flag size={14} />
              )}
              {metricCard(
                "Recorded length",
                duration(workspace.metrics.recordedSeconds),
                <Clock size={14} />
              )}
              {metricCard(
                "Teacher / student turns",
                `${workspace.metrics.teacherSegments} / ${workspace.metrics.studentSegments}`,
                <Users size={14} />
              )}
              {metricCard(
                "Unlabelled turns",
                String(workspace.metrics.unknownSegments),
                <AlertTriangle size={14} />
              )}
              <TalkBalance metrics={workspace.metrics} />
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <section>
                <h2 className="mb-3 text-xl font-semibold">Transcript</h2>
                <ol className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
                  {workspace.segments.map((segment) => {
                    const flagged = segment.flags.length > 0;
                    return (
                      <li
                        key={segment.id}
                        className={`rounded-2xl border p-4 ${
                          flagged
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
                            <span
                              key={flag}
                              className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-semibold text-amber-700 dark:text-amber-400"
                            >
                              {flagLabel[flag] ?? flag}
                            </span>
                          ))}
                        </div>
                        <p className="whitespace-pre-wrap text-sm">
                          {segment.text}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </section>

              <ReviewForm
                key={`${lessonId}:${workspace.review?.updatedAt ?? "new"}`}
                lessonId={lessonId}
                review={workspace.review}
                onSaved={(status) =>
                  setNotice(
                    status === "submitted"
                      ? "Review submitted."
                      : "Draft saved."
                  )
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
