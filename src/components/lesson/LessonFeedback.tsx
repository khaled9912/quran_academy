"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ClipboardList,
  Loader2,
  MessageSquareQuote,
  PencilLine,
} from "lucide-react";
import { ApiError } from "@/lib/backend-client";
import {
  lessonDateTime,
  progressClasses,
  progressLabels,
} from "@/lib/lesson-feedback";
import { saveLessonReport, saveLessonReview } from "@/services/lesson.service";
import { StarRating, StarRatingInput } from "@/components/ui/star-rating";
import type {
  Lesson,
  LessonProgress,
  LessonReport,
  TeacherReview,
} from "@/types/lesson";

const inputClass =
  "w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500";

const progressOptions: LessonProgress[] = [
  "excellent",
  "good",
  "needs_attention",
];

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback;

function ReportContent({ report }: { report: LessonReport }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${progressClasses[report.progress]}`}
        >
          {progressLabels[report.progress]}
        </span>
        <span className="text-xs text-foreground opacity-60">
          {lessonDateTime(report.updatedAt)}
        </span>
      </div>
      <div className="mt-4 space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-foreground opacity-60">
            Class summary
          </p>
          <p className="mt-1 whitespace-pre-line">{report.classSummary}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-foreground opacity-60">
            Feedback about the student
          </p>
          <p className="mt-1 whitespace-pre-line">{report.studentFeedback}</p>
        </div>
      </div>
    </>
  );
}

function ReviewContent({ review }: { review: TeacherReview }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <StarRating value={review.rating} count={1} />
        <span className="text-xs text-foreground opacity-60">
          {lessonDateTime(review.updatedAt)}
        </span>
      </div>
      {review.comment && (
        <p className="mt-3 whitespace-pre-line">{review.comment}</p>
      )}
    </>
  );
}

function TeacherReportSection({
  lesson,
  report,
  onSaved,
}: {
  lesson: Lesson;
  report: LessonReport | null;
  onSaved: (report: LessonReport) => void;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(!report);
  const [classSummary, setClassSummary] = useState(report?.classSummary ?? "");
  const [studentFeedback, setStudentFeedback] = useState(
    report?.studentFeedback ?? ""
  );
  const [progress, setProgress] = useState<LessonProgress>(
    report?.progress ?? "good"
  );
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      saveLessonReport(lesson.id, { classSummary, studentFeedback, progress }),
    onSuccess: (saved) => {
      onSaved(saved);
      setEditing(false);
      setFormError("");
      setNotice("Your class report has been saved.");
      void queryClient.invalidateQueries({ queryKey: ["lessons"] });
      void queryClient.invalidateQueries({ queryKey: ["profile", "reports"] });
    },
    onError: (error) =>
      setFormError(
        errorMessage(
          error,
          "Unable to save the class report. Please try again."
        )
      ),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    setFormError("");
    if (classSummary.trim().length < 10) {
      setFormError("Summarize the class in at least 10 characters.");
      return;
    }
    if (studentFeedback.trim().length < 10) {
      setFormError(
        "Give feedback about the student in at least 10 characters."
      );
      return;
    }
    mutation.mutate();
  };

  if (report && !editing) {
    return (
      <section className="rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <ClipboardList
              size={20}
              className="text-green-600 dark:text-green-400"
            />
            Class report
          </h2>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm font-semibold hover:border-green-500"
          >
            <PencilLine size={15} /> Edit report
          </button>
        </div>
        <div className="mt-5">
          <ReportContent report={report} />
        </div>
        {notice && (
          <p
            role="status"
            className="mt-5 flex items-start gap-2 rounded-xl border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 p-4 text-sm text-green-800 dark:text-green-300"
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            {notice}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <ClipboardList
          size={20}
          className="text-green-600 dark:text-green-400"
        />
        Class report required
      </h2>
      <p className="mt-2 text-sm text-foreground opacity-70">
        Summarize the class and give the student feedback. The report is saved
        in the student&apos;s profile and marks the lesson as completed.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="class-summary"
            className="mb-2 block text-sm font-semibold"
          >
            Class summary
          </label>
          <textarea
            id="class-summary"
            value={classSummary}
            onChange={(event) => setClassSummary(event.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="What did you cover in this lesson?"
            className={inputClass}
            disabled={mutation.isPending}
          />
          <p className="mt-1 text-xs text-foreground opacity-60">
            {classSummary.trim().length} / 2000 characters
          </p>
        </div>

        <div>
          <label
            htmlFor="student-feedback"
            className="mb-2 block text-sm font-semibold"
          >
            Feedback about the student
          </label>
          <textarea
            id="student-feedback"
            value={studentFeedback}
            onChange={(event) => setStudentFeedback(event.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Strengths, areas to improve, and what to practice next."
            className={inputClass}
            disabled={mutation.isPending}
          />
          <p className="mt-1 text-xs text-foreground opacity-60">
            {studentFeedback.trim().length} / 2000 characters
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold">Progress</p>
          <div className="flex flex-wrap gap-2">
            {progressOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setProgress(option)}
                disabled={mutation.isPending}
                aria-pressed={progress === option}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  progress === option
                    ? "bg-green-500 text-white"
                    : "border border-card-border hover:border-green-500"
                }`}
              >
                {progressLabels[option]}
              </button>
            ))}
          </div>
        </div>

        {formError && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
          >
            {formError}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
          >
            {mutation.isPending && (
              <Loader2 size={18} className="animate-spin" />
            )}
            {mutation.isPending
              ? "Saving…"
              : report
                ? "Save report"
                : "Submit report"}
          </button>
          {report && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={mutation.isPending}
              className="rounded-xl border border-card-border px-6 py-3 font-semibold hover:border-green-500 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

function StudentReportCard({ report }: { report: LessonReport | null }) {
  if (!report) {
    return (
      <section className="rounded-3xl border border-dashed border-card-border bg-card-bg p-6 md:p-8">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <ClipboardList
            size={20}
            className="text-green-600 dark:text-green-400"
          />
          Class report
        </h2>
        <p className="mt-2 text-sm text-foreground opacity-70">
          Your teacher&apos;s report for this class will appear here once it is
          submitted.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <ClipboardList
          size={20}
          className="text-green-600 dark:text-green-400"
        />
        Class report
      </h2>
      <div className="mt-5">
        <ReportContent report={report} />
      </div>
    </section>
  );
}

function StudentReviewSection({
  lesson,
  review,
  onSaved,
}: {
  lesson: Lesson;
  review: TeacherReview | null;
  onSaved: (review: TeacherReview) => void;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(!review);
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [comment, setComment] = useState(review?.comment ?? "");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const mutation = useMutation({
    mutationFn: () => saveLessonReview(lesson.id, { rating, comment }),
    onSuccess: (saved) => {
      onSaved(saved);
      setEditing(false);
      setFormError("");
      setNotice("Thank you — your review has been saved.");
      void queryClient.invalidateQueries({ queryKey: ["lessons"] });
      void queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
    onError: (error) =>
      setFormError(
        errorMessage(error, "Unable to save your review. Please try again.")
      ),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    setFormError("");
    if (rating < 1) {
      setFormError("Choose a rating from 1 to 5 stars.");
      return;
    }
    mutation.mutate();
  };

  if (review && !editing) {
    return (
      <section className="rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <MessageSquareQuote
              size={20}
              className="text-green-600 dark:text-green-400"
            />
            Your review
          </h2>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm font-semibold hover:border-green-500"
          >
            <PencilLine size={15} /> Update review
          </button>
        </div>
        <div className="mt-4">
          <ReviewContent review={review} />
        </div>
        {notice && (
          <p
            role="status"
            className="mt-5 flex items-start gap-2 rounded-xl border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 p-4 text-sm text-green-800 dark:text-green-300"
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            {notice}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <MessageSquareQuote
          size={20}
          className="text-green-600 dark:text-green-400"
        />
        Rate this lesson
      </h2>
      <p className="mt-2 text-sm text-foreground opacity-70">
        Your rating helps other students choose a teacher.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <div>
          <p className="mb-2 text-sm font-semibold">Your rating</p>
          <StarRatingInput
            value={rating}
            onChange={setRating}
            disabled={mutation.isPending}
          />
        </div>

        <div>
          <label
            htmlFor="review-comment"
            className="mb-2 block text-sm font-semibold"
          >
            Comment <span className="font-normal opacity-60">(optional)</span>
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="What went well? What could be better?"
            className={inputClass}
            disabled={mutation.isPending}
          />
          <p className="mt-1 text-xs text-foreground opacity-60">
            {comment.trim().length} / 2000 characters
          </p>
        </div>

        {formError && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
          >
            {formError}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
          >
            {mutation.isPending && (
              <Loader2 size={18} className="animate-spin" />
            )}
            {mutation.isPending
              ? "Saving…"
              : review
                ? "Save review"
                : "Submit review"}
          </button>
          {review && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={mutation.isPending}
              className="rounded-xl border border-card-border px-6 py-3 font-semibold hover:border-green-500 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

/** Post-lesson report (teacher) and review (student) panel. */
export function LessonFeedback({
  lesson,
  role,
}: {
  lesson: Lesson;
  role?: string | null;
}) {
  const [report, setReport] = useState<LessonReport | null>(
    lesson.report ?? null
  );
  const [review, setReview] = useState<TeacherReview | null>(
    lesson.review ?? null
  );

  useEffect(() => {
    setReport(lesson.report ?? null);
    setReview(lesson.review ?? null);
  }, [lesson.report, lesson.review]);

  if (role === "teacher") {
    return (
      <div className="space-y-6">
        <TeacherReportSection
          lesson={lesson}
          report={report}
          onSaved={setReport}
        />
        {review && (
          <section className="rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <MessageSquareQuote
                size={20}
                className="text-green-600 dark:text-green-400"
              />
              Student review
            </h2>
            <div className="mt-4">
              <ReviewContent review={review} />
            </div>
          </section>
        )}
      </div>
    );
  }

  if (role === "student") {
    return (
      <div className="space-y-6">
        <StudentReportCard report={report} />
        <StudentReviewSection
          lesson={lesson}
          review={review}
          onSaved={setReview}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <ClipboardList
            size={20}
            className="text-green-600 dark:text-green-400"
          />
          Class report
        </h2>
        <div className="mt-5">
          {report ? (
            <ReportContent report={report} />
          ) : (
            <p className="text-sm text-foreground opacity-70">
              The teacher has not submitted a report yet.
            </p>
          )}
        </div>
      </section>
      <section className="rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <MessageSquareQuote
            size={20}
            className="text-green-600 dark:text-green-400"
          />
          Student review
        </h2>
        <div className="mt-4">
          {review ? (
            <ReviewContent review={review} />
          ) : (
            <p className="text-sm text-foreground opacity-70">
              The student has not reviewed this lesson yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
