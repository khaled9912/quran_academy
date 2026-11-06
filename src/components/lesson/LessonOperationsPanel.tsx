"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Loader2,
  PhoneCall,
  UserX,
  Video,
  XCircle,
} from "lucide-react";
import { ApiError } from "@/lib/backend-client";
import { useAuth } from "@/providers/auth-provider";
import {
  callLesson,
  cancelLesson,
  cancelRescheduleRequest,
  createReplacementLesson,
  createRescheduleRequest,
  getLessonOperations,
  reportLessonIncident,
  requestExcuse,
  respondToRescheduleRequest,
} from "@/services/lesson.service";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";
import { useNow } from "@/hooks/use-now";
import { SelectField } from "@/components/ui/select-field";
import type {
  AttendanceParticipant,
  CancellationPreview,
  Lesson,
  LessonOperations,
  RescheduleRequest,
} from "@/types/lesson";

const inputClass =
  "w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500";

const dateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const toLocalInput = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const minutesLabel = (seconds: number) => `${Math.round(seconds / 60)} min`;

const outcomeLabels: Record<string, string> = {
  free_cancellation: "Free cancellation",
  grace_cancellation: "Grace cancellation used",
  late_cancellation: "Late cancellation",
  cancelled_by_teacher: "Cancelled by the teacher",
  late_cancelled_by_teacher: "Late cancellation by the teacher",
  admin_cancelled: "Cancelled by the academy",
  student_no_show: "Student no-show",
  teacher_no_show: "Teacher no-show",
  both_absent: "Both participants absent",
  series_ended: "Weekly lessons ended",
};

const rescheduleStatusLabels: Record<string, string> = {
  pending: "Waiting for a reply",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
  cancelled: "Withdrawn",
};

const excuseCategories = [
  { value: "illness", label: "Illness" },
  { value: "family_emergency", label: "Family emergency" },
  { value: "technical", label: "Technical problem" },
  { value: "other", label: "Other" },
];

const incidentTypes = [
  { value: "attendance_dispute", label: "Attendance dispute" },
  { value: "potential_student_no_show", label: "Student did not attend" },
  { value: "potential_teacher_no_show", label: "Teacher did not attend" },
];

/** Mirrors the backend guard so the button explains itself instead of failing. */
const CALL_COOLDOWN_MS = 30_000;
const CALLS_PER_LESSON = 3;
const CALL_LEAD_MS = 15 * 60_000;

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback;

function Section({
  title,
  icon,
  children,
  tone = "plain",
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  tone?: "plain" | "warning" | "danger";
}) {
  const border =
    tone === "danger"
      ? "border-red-500/40"
      : tone === "warning"
        ? "border-amber-500/40"
        : "border-card-border";
  return (
    <section className={`rounded-3xl border ${border} bg-card-bg p-6 md:p-7`}>
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        {icon}
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-sm">{children}</div>
    </section>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-xl border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 p-3 text-sm text-green-800 dark:text-green-300">
      <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
      {children}
    </p>
  );
}

function ErrorNotice({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300"
    >
      {children}
    </p>
  );
}

function CreditSummary({ preview }: { preview: CancellationPreview }) {
  if (preview.creditEffect === "none" && preview.teacherPayableMinutes === 0) {
    return null;
  }
  const parts: string[] = [];
  if (preview.creditEffect === "deduct") {
    parts.push("One lesson credit will be deducted.");
  } else if (preview.creditEffect === "restore") {
    parts.push("One lesson credit will be restored to the student.");
  }
  if (preview.teacherPayableMinutes > 0) {
    parts.push(
      `${preview.teacherPayableMinutes} teacher minutes may be payable.`
    );
  }
  if (parts.length === 0) return null;
  return (
    <ul className="list-disc space-y-1 pl-5 text-foreground opacity-75">
      {parts.map((part) => (
        <li key={part}>{part}</li>
      ))}
    </ul>
  );
}

function RescheduleCard({
  request,
  viewerId,
  canRespond,
  busy,
  onRespond,
  onWithdraw,
}: {
  request: RescheduleRequest;
  viewerId?: string;
  canRespond: boolean;
  busy: boolean;
  onRespond: (action: "accept" | "decline", note: string) => void;
  onWithdraw: () => void;
}) {
  const [note, setNote] = useState("");
  const mine = request.requestedById === viewerId;
  return (
    <div className="rounded-2xl border border-card-border bg-background p-4">
      <p className="font-semibold">
        {dateTime(request.proposedStartsAt)} –{" "}
        {new Date(request.proposedEndsAt).toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      </p>
      <p className="mt-1 text-foreground opacity-70">
        Proposed by {mine ? "you" : request.requestedByName} ·{" "}
        {rescheduleStatusLabels[request.status] ?? request.status}
        {request.status === "pending" &&
          ` · ${Math.max(0, request.minutesRemaining)} min to reply`}
      </p>
      {request.note && (
        <p className="mt-2 whitespace-pre-line text-foreground opacity-75">
          {request.note}
        </p>
      )}
      {request.responseNote && (
        <p className="mt-2 text-foreground opacity-75">
          Reply: {request.responseNote}
        </p>
      )}
      {request.status === "pending" && (
        <div className="mt-3 space-y-3">
          {mine || !canRespond ? (
            mine && (
              <button
                type="button"
                disabled={busy}
                onClick={onWithdraw}
                className="rounded-xl border border-card-border px-4 py-2 text-sm font-semibold hover:border-green-500 disabled:opacity-50"
              >
                Withdraw request
              </button>
            )
          ) : (
            <>
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={500}
                placeholder="Optional reply note"
                className={inputClass}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onRespond("accept", note)}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
                >
                  {busy && <Loader2 size={15} className="animate-spin" />}
                  Accept new time
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onRespond("decline", note)}
                  className="rounded-xl border border-card-border px-4 py-2 text-sm font-semibold hover:border-green-500 disabled:opacity-50"
                >
                  Keep current time
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CancellationSection({
  lesson,
  operations,
  role,
}: {
  lesson: Lesson;
  operations: LessonOperations;
  role: string | null;
}) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const preview = operations.cancellation;
  const record = operations.cancellationRecord;
  const isAdmin = role === "admin" || role === "super_admin";

  const mutation = useMutation({
    mutationFn: () => cancelLesson(lesson.id, reason),
    onSuccess: () => {
      setConfirming(false);
      setReason("");
      setError("");
      setNotice("The lesson was cancelled and both sides were notified.");
      void queryClient.invalidateQueries({ queryKey: ["lessons"] });
      void queryClient.invalidateQueries({
        queryKey: ["lesson-ops", lesson.id],
      });
      void queryClient.invalidateQueries({ queryKey: ["student", "credits"] });
    },
    onError: (failure) =>
      setError(
        errorMessage(failure, "Unable to cancel this lesson. Please try again.")
      ),
  });

  if (record || lesson.status === "cancelled") {
    const outcome = record?.outcome ?? lesson.cancellationOutcome;
    return (
      <Section
        title="Cancellation"
        icon={<XCircle size={19} className="text-red-600 dark:text-red-400" />}
        tone="danger"
      >
        <p className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-red-100 dark:bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">
            {outcomeLabels[outcome ?? ""] ?? "Cancelled"}
          </span>
          {lesson.cancelledAt && (
            <span className="text-xs text-foreground opacity-60">
              {dateTime(lesson.cancelledAt)}
            </span>
          )}
        </p>
        {record && (
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-[.14em] opacity-60">
                Cancelled by
              </dt>
              <dd className="capitalize">{record.actorRole}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[.14em] opacity-60">
                Notice
              </dt>
              <dd>{record.hoursBefore.toFixed(1)} hours before start</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[.14em] opacity-60">
                Teacher minutes
              </dt>
              <dd>{record.teacherPayableMinutes} payable</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[.14em] opacity-60">
                Credit
              </dt>
              <dd>
                {outcome === "late_cancellation" ||
                outcome === "student_no_show"
                  ? "One credit deducted"
                  : outcome === "free_cancellation" ||
                      outcome === "grace_cancellation"
                    ? "No credit change"
                    : "One credit restored"}
              </dd>
            </div>
          </dl>
        )}
        {(record?.reason ?? lesson.cancelReason) && (
          <p className="whitespace-pre-line rounded-xl bg-background p-3 opacity-80">
            {record?.reason ?? lesson.cancelReason}
          </p>
        )}
        {notice && <Notice>{notice}</Notice>}
      </Section>
    );
  }

  if (!preview.allowed) {
    return (
      <Section
        title="Cancellation"
        icon={<XCircle size={19} className="text-foreground opacity-60" />}
      >
        <p className="text-foreground opacity-70">
          {preview.blockedReason ??
            "This lesson can no longer be cancelled from this page."}
        </p>
      </Section>
    );
  }

  return (
    <Section
      title={isAdmin ? "Cancel as academy" : "Cancel this lesson"}
      icon={
        <AlertTriangle
          size={19}
          className="text-amber-600 dark:text-amber-400"
        />
      }
      tone="warning"
    >
      <p className="text-foreground opacity-80">{preview.explanation}</p>
      <CreditSummary preview={preview} />
      {preview.isLate && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-800 dark:text-amber-300">
          This is a late cancellation.
          {preview.usedGrace
            ? " Your free grace cancellation for this month is being used."
            : preview.creditEffect === "deduct"
              ? " One lesson credit will be deducted."
              : ""}
        </p>
      )}
      {notice && <Notice>{notice}</Notice>}
      {error && <ErrorNotice>{error}</ErrorNotice>}
      {!confirming ? (
        <button
          type="button"
          onClick={() => {
            setNotice("");
            setConfirming(true);
          }}
          className="rounded-xl border border-red-300 dark:border-red-500/30 px-5 py-2.5 font-semibold text-red-700 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
        >
          {isAdmin ? "Cancel lesson as academy" : "Cancel lesson"}
        </button>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            mutation.mutate();
          }}
          className="space-y-3"
        >
          <label className="block">
            <span className="mb-1 block font-semibold">
              Reason <span className="font-normal opacity-60">(optional)</span>
            </span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Let the other side know what happened."
              className={inputClass}
              disabled={mutation.isPending}
            />
          </label>
          <p className="text-xs text-foreground opacity-60">
            Cancelling cannot be undone. Rescheduling is a separate request.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {mutation.isPending && (
                <Loader2 size={16} className="animate-spin" />
              )}
              Confirm cancellation
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={mutation.isPending}
              className="rounded-xl border border-card-border px-5 py-2.5 font-semibold hover:border-green-500 disabled:opacity-50"
            >
              Keep the lesson
            </button>
          </div>
        </form>
      )}
    </Section>
  );
}

function RescheduleSection({
  lesson,
  operations,
  role,
  viewerId,
}: {
  lesson: Lesson;
  operations: LessonOperations;
  role: string | null;
  viewerId?: string;
}) {
  const queryClient = useQueryClient();
  const [startsAt, setStartsAt] = useState(() =>
    toLocalInput(new Date(new Date(lesson.startsAt).getTime() + 24 * 3600_000))
  );
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const pending = operations.pendingReschedule;
  const isAdmin = role === "admin" || role === "super_admin";
  const canRequest =
    (role === "teacher" || role === "student" || isAdmin) &&
    lesson.status === "scheduled" &&
    new Date(lesson.endsAt).getTime() > Date.now();

  const durationMs =
    new Date(lesson.endsAt).getTime() - new Date(lesson.startsAt).getTime();
  const proposedStart = startsAt ? new Date(startsAt) : null;
  const proposedEnd =
    proposedStart && !Number.isNaN(proposedStart.getTime())
      ? new Date(proposedStart.getTime() + durationMs)
      : null;

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["lesson-ops", lesson.id] });
    void queryClient.invalidateQueries({ queryKey: ["lessons"] });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      createRescheduleRequest(lesson.id, {
        startsAt: proposedStart!.toISOString(),
        endsAt: proposedEnd!.toISOString(),
        note,
      }),
    onSuccess: () => {
      setError("");
      setNotice(
        "Your reschedule request was sent. The lesson stays as scheduled until it is accepted."
      );
      refresh();
    },
    onError: (failure) =>
      setError(errorMessage(failure, "Unable to send the reschedule request.")),
  });

  const respondMutation = useMutation({
    mutationFn: ({
      action,
      note: reply,
    }: {
      action: "accept" | "decline";
      note: string;
    }) => respondToRescheduleRequest(pending!.id, action, reply),
    onSuccess: (_, variables) => {
      setError("");
      setNotice(
        variables.action === "accept"
          ? "The lesson was moved to the new time."
          : "The lesson stays at its current time."
      );
      refresh();
    },
    onError: (failure) =>
      setError(errorMessage(failure, "Unable to reply to the request.")),
  });

  const withdrawMutation = useMutation({
    mutationFn: () => cancelRescheduleRequest(pending!.id),
    onSuccess: () => {
      setError("");
      setNotice("Your reschedule request was withdrawn.");
      refresh();
    },
    onError: (failure) =>
      setError(errorMessage(failure, "Unable to withdraw the request.")),
  });

  const busy =
    createMutation.isPending ||
    respondMutation.isPending ||
    withdrawMutation.isPending;

  if (!pending && !canRequest) return null;

  return (
    <Section
      title="Reschedule"
      icon={
        <CalendarClock
          size={19}
          className="text-green-600 dark:text-green-400"
        />
      }
    >
      <p className="text-foreground opacity-70">
        A reschedule is a request, not a cancellation. The lesson keeps its time
        until the other side accepts.
      </p>
      {notice && <Notice>{notice}</Notice>}
      {error && <ErrorNotice>{error}</ErrorNotice>}

      {pending && (
        <RescheduleCard
          request={pending}
          viewerId={viewerId}
          canRespond={canRequest || isAdmin}
          busy={busy}
          onRespond={(action, reply) =>
            respondMutation.mutate({ action, note: reply })
          }
          onWithdraw={() => withdrawMutation.mutate()}
        />
      )}

      {!pending && canRequest && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            setNotice("");
            if (!proposedStart || !proposedEnd) {
              setError("Choose a new date and time.");
              return;
            }
            if (proposedStart.getTime() <= Date.now()) {
              setError("Choose a future time.");
              return;
            }
            createMutation.mutate();
          }}
          className="space-y-3"
        >
          <label className="block">
            <span className="mb-1 block font-semibold">New date and time</span>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              className={inputClass}
              disabled={busy}
            />
          </label>
          {proposedEnd && (
            <p className="text-xs text-foreground opacity-60">
              Ends {dateTime(proposedEnd.toISOString())} · same{" "}
              {Math.round(durationMs / 60000)}-minute length.
            </p>
          )}
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={1000}
            placeholder="Optional note for the other side"
            className={inputClass}
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
          >
            {createMutation.isPending && (
              <Loader2 size={16} className="animate-spin" />
            )}
            Send reschedule request
          </button>
        </form>
      )}

      {operations.rescheduleHistory.filter((item) => item.status !== "pending")
        .length > 0 && (
        <details className="rounded-xl border border-card-border p-3">
          <summary className="cursor-pointer font-semibold">
            Reschedule history
          </summary>
          <ul className="mt-3 space-y-2">
            {operations.rescheduleHistory
              .filter((item) => item.status !== "pending")
              .map((item) => (
                <li key={item.id} className="rounded-lg bg-background p-3">
                  <p className="font-medium">
                    {dateTime(item.proposedStartsAt)} ·{" "}
                    {rescheduleStatusLabels[item.status] ?? item.status}
                  </p>
                  <p className="text-xs opacity-60">
                    {item.requestedByName} · {dateTime(item.createdAt)}
                  </p>
                  {item.responseNote && (
                    <p className="mt-1 opacity-75">{item.responseNote}</p>
                  )}
                </li>
              ))}
          </ul>
        </details>
      )}
    </Section>
  );
}

function MakeupSection({
  lesson,
  operations,
  role,
}: {
  lesson: Lesson;
  operations: LessonOperations;
  role: string | null;
}) {
  const queryClient = useQueryClient();
  const isAdmin = role === "admin" || role === "super_admin";
  const canCreate =
    lesson.status === "cancelled" &&
    !lesson.isMakeup &&
    !operations.replacementLesson &&
    (role === "teacher" || isAdmin);
  const [startsAt, setStartsAt] = useState(() => toLocalInput(new Date()));
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const durationMs =
    new Date(lesson.endsAt).getTime() - new Date(lesson.startsAt).getTime();
  const proposedStart = startsAt ? new Date(startsAt) : null;
  const proposedEnd =
    proposedStart && !Number.isNaN(proposedStart.getTime())
      ? new Date(proposedStart.getTime() + durationMs)
      : null;

  const mutation = useMutation({
    mutationFn: () =>
      createReplacementLesson(lesson.id, {
        startsAt: proposedStart!.toISOString(),
        endsAt: proposedEnd!.toISOString(),
        note,
      }),
    onSuccess: () => {
      setError("");
      setNotice("A make-up lesson was scheduled and the student was notified.");
      void queryClient.invalidateQueries({
        queryKey: ["lesson-ops", lesson.id],
      });
      void queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
    onError: (failure) =>
      setError(errorMessage(failure, "Unable to schedule the make-up lesson.")),
  });

  if (lesson.isMakeup || operations.originalLesson) {
    return (
      <Section
        title="Make-up lesson"
        icon={
          <Video size={19} className="text-green-600 dark:text-green-400" />
        }
      >
        <p className="text-foreground opacity-75">
          This is a make-up lesson.
          {operations.originalLesson && (
            <>
              {" "}
              It replaces the cancelled lesson on{" "}
              {dateTime(operations.originalLesson.startsAt)}.{" "}
              <Link
                href={`/lesson/${operations.originalLesson.id}`}
                className="font-semibold text-green-600 dark:text-green-400 hover:underline"
              >
                Open the original lesson
              </Link>
              .
            </>
          )}
        </p>
      </Section>
    );
  }

  if (operations.replacementLesson) {
    return (
      <Section
        title="Make-up lesson"
        icon={
          <Video size={19} className="text-green-600 dark:text-green-400" />
        }
      >
        <p className="text-foreground opacity-75">
          A make-up lesson is scheduled for{" "}
          {dateTime(operations.replacementLesson.startsAt)}.{" "}
          <Link
            href={`/lesson/${operations.replacementLesson.id}`}
            className="font-semibold text-green-600 dark:text-green-400 hover:underline"
          >
            Open the make-up lesson
          </Link>
          .
        </p>
      </Section>
    );
  }

  if (!canCreate) return null;

  return (
    <Section
      title="Schedule a make-up lesson"
      icon={
        <CalendarClock
          size={19}
          className="text-green-600 dark:text-green-400"
        />
      }
    >
      <p className="text-foreground opacity-70">
        The make-up keeps the original {Math.round(durationMs / 60000)}-minute
        length and adds no extra charge or credit.
      </p>
      {notice && <Notice>{notice}</Notice>}
      {error && <ErrorNotice>{error}</ErrorNotice>}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setError("");
          setNotice("");
          if (!proposedStart || !proposedEnd) {
            setError("Choose a date and time.");
            return;
          }
          if (proposedStart.getTime() <= Date.now()) {
            setError("Choose a future time.");
            return;
          }
          mutation.mutate();
        }}
        className="space-y-3"
      >
        <label className="block">
          <span className="mb-1 block font-semibold">
            Make-up date and time
          </span>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
            className={inputClass}
            disabled={mutation.isPending}
          />
        </label>
        {proposedEnd && (
          <p className="text-xs text-foreground opacity-60">
            Ends {dateTime(proposedEnd.toISOString())}.
          </p>
        )}
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Optional note for the student"
          className={inputClass}
          disabled={mutation.isPending}
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
        >
          {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
          Schedule make-up lesson
        </button>
      </form>
    </Section>
  );
}

/**
 * Attendance doubles as the doorbell: whoever is not in the room yet can be
 * rung from here. The backend decides who gets called for a participant and
 * only staff name a side, so a mistapped button can never ring the wrong person.
 */
function AttendanceSection({
  lesson,
  operations,
  viewerId,
  role,
}: {
  lesson: Lesson;
  operations: LessonOperations;
  viewerId?: string;
  role: string | null;
}) {
  const queryClient = useQueryClient();
  const now = useNow(5_000);
  const [callError, setCallError] = useState("");
  const summary = operations.attendance;
  const hours = operations.hours;
  const calls = operations.calls ?? [];
  const mine = calls.filter((entry) => entry.callerId === viewerId);
  const lastMine = mine[0];
  const coolingForMs = lastMine
    ? CALL_COOLDOWN_MS - (now - Date.parse(lastMine.createdAt))
    : 0;
  const isParticipant =
    viewerId === lesson.teacherId || viewerId === lesson.studentId;
  const isStaff = role === "admin" || role === "super_admin" || role === "support";
  const inCallWindow =
    lesson.status !== "cancelled" &&
    lesson.status !== "completed" &&
    now >= Date.parse(lesson.startsAt) - CALL_LEAD_MS &&
    now < Date.parse(lesson.endsAt);

  const call = useMutation({
    mutationFn: (targetRole?: string) =>
      callLesson(lesson.id, isParticipant ? undefined : targetRole),
    onSuccess: () => {
      setCallError("");
      void queryClient.invalidateQueries({ queryKey: ["lesson-ops", lesson.id] });
      void queryClient.invalidateQueries({ queryKey: ["lesson-calls"] });
    },
    onError: (failure) =>
      setCallError(errorMessage(failure, "The call could not be sent.")),
  });

  const ringable = (participant: AttendanceParticipant) =>
    inCallWindow &&
    participant.status !== "joined" &&
    (isStaff || (isParticipant && participant.userId !== viewerId));
  return (
    <Section
      title="Attendance"
      icon={
        <ClipboardCheck
          size={19}
          className="text-green-600 dark:text-green-400"
        />
      }
    >
      <p className="text-xs text-foreground opacity-60">
        Recorded by the lesson room itself, from real join and leave times.
      </p>
      <div className="space-y-3">
        {summary.participants.map((participant) => (
          <div
            key={participant.userId}
            className="rounded-2xl border border-card-border bg-background p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">
                {participant.name}{" "}
                <span className="text-xs font-normal capitalize opacity-60">
                  ({participant.role})
                </span>
              </p>
              <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
                {minutesLabel(participant.totalSeconds)}
              </span>
            </div>
            <p className="mt-1 text-xs text-foreground opacity-70">
              {participant.status === "not_joined"
                ? "Did not join"
                : participant.status === "absent"
                  ? "Recorded absent"
                  : participant.status === "joined"
                    ? "In the room now"
                    : "Left the room"}
              {participant.joinedLate && " · joined late"}
              {participant.leftEarly && " · left early"}
              {participant.reconnectionCount > 0 &&
                ` · ${participant.reconnectionCount} reconnection${
                  participant.reconnectionCount === 1 ? "" : "s"
                }`}
            </p>
            {participant.firstJoinedAt && (
              <p className="mt-1 text-xs text-foreground opacity-60">
                First joined {dateTime(participant.firstJoinedAt)}
                {participant.lastLeftAt
                  ? ` · last left ${dateTime(participant.lastLeftAt)}`
                  : ""}
              </p>
            )}
            {ringable(participant) && (
              <button
                type="button"
                disabled={coolingForMs > 0 || mine.length >= CALLS_PER_LESSON || call.isPending}
                onClick={() => call.mutate(participant.role)}
                title={
                  coolingForMs > 0
                    ? "Wait a moment before calling again"
                    : mine.length >= CALLS_PER_LESSON
                      ? "You have used the three calls allowed for this lesson"
                      : `Sends a loud call to ${participant.name}`
                }
                className="mt-2 inline-flex items-center gap-2 rounded-xl border border-card-border px-3 py-1.5 text-xs font-semibold hover:border-green-500 disabled:opacity-50"
              >
                {call.isPending && call.variables === participant.role ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <PhoneCall size={14} />
                )}
                {coolingForMs > 0
                  ? `Wait ${Math.ceil(coolingForMs / 1000)} s`
                  : mine.length >= CALLS_PER_LESSON
                    ? "Call limit reached"
                    : participant.role === "teacher"
                      ? "Call the teacher"
                      : "Call the student"}
              </button>
            )}
          </div>
        ))}
      </div>
      {hours && (
        <dl className="grid gap-2 rounded-2xl border border-card-border bg-background p-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase tracking-[.14em] opacity-60">
              Scheduled
            </dt>
            <dd>{hours.scheduledMinutes} min</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-[.14em] opacity-60">
              Actual attendance
            </dt>
            <dd>{hours.actualAttendanceMinutes} min</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-[.14em] opacity-60">
              Proposed payable
            </dt>
            <dd>{hours.proposedPayableMinutes} min</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-[.14em] opacity-60">
              Approved
            </dt>
            <dd className="capitalize">
              {hours.approvalStatus}
              {hours.approvedPayableMinutes != null
                ? ` · ${hours.approvedPayableMinutes} min`
                : ""}
            </dd>
          </div>
        </dl>
      )}
      {calls.length > 0 && (
        <div className="rounded-2xl border border-card-border bg-background p-4 text-xs text-foreground opacity-70">
          {calls.slice(0, 3).map((entry) => (
            <p key={entry.id}>
              {entry.callerName} called {entry.calleeName} ·{" "}
              {dateTime(entry.createdAt)}
            </p>
          ))}
        </div>
      )}
      {callError && (
        <p role="status" className="text-xs font-semibold text-red-600 dark:text-red-400">
          {callError}
        </p>
      )}
    </Section>
  );
}

function ExcuseSection({
  lesson,
  operations,
  role,
}: {
  lesson: Lesson;
  operations: LessonOperations;
  role: string | null;
}) {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("illness");
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const outcome = lesson.cancellationOutcome;
  const eligible =
    role === "student" &&
    (outcome === "late_cancellation" ||
      outcome === "student_no_show" ||
      outcome === "both_absent");
  const existing = operations.excuse;

  const mutation = useMutation({
    mutationFn: () => requestExcuse(lesson.id, { category, explanation }),
    onSuccess: () => {
      setError("");
      setNotice("Your excuse request was sent for review.");
      void queryClient.invalidateQueries({
        queryKey: ["lesson-ops", lesson.id],
      });
    },
    onError: (failure) =>
      setError(errorMessage(failure, "Unable to send the excuse request.")),
  });

  if (!eligible && !existing) return null;

  return (
    <Section
      title="Excuse request"
      icon={
        <AlertTriangle
          size={19}
          className="text-amber-600 dark:text-amber-400"
        />
      }
    >
      {existing ? (
        <div className="space-y-2">
          <p>
            Status:{" "}
            <span className="font-semibold capitalize">{existing.status}</span>{" "}
            · {existing.category.replaceAll("_", " ")}
          </p>
          <p className="whitespace-pre-line opacity-75">
            {existing.explanation}
          </p>
          {existing.adminNote && (
            <p className="rounded-xl bg-background p-3 opacity-75">
              Academy note: {existing.adminNote}
            </p>
          )}
          {existing.status === "approved" && (
            <p className="text-green-700 dark:text-green-400">
              This late cancellation or no-show was excused.
            </p>
          )}
        </div>
      ) : (
        <>
          <p className="text-foreground opacity-70">
            If illness, a family emergency, or a technical problem caused this,
            ask the academy to review it. An approved excuse restores the lesson
            credit.
          </p>
          {notice && <Notice>{notice}</Notice>}
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setError("");
              setNotice("");
              if (explanation.trim().length < 10) {
                setError("Explain what happened in at least 10 characters.");
                return;
              }
              mutation.mutate();
            }}
            className="space-y-3"
          >
            <SelectField
              value={category}
              onChange={setCategory}
              options={excuseCategories}
              disabled={mutation.isPending}
            />
            <textarea
              value={explanation}
              onChange={(event) => setExplanation(event.target.value)}
              rows={4}
              minLength={10}
              maxLength={2000}
              placeholder="What happened?"
              className={inputClass}
              disabled={mutation.isPending}
            />
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
            >
              {mutation.isPending && (
                <Loader2 size={16} className="animate-spin" />
              )}
              Send excuse request
            </button>
          </form>
        </>
      )}
    </Section>
  );
}

function IncidentSection({
  lesson,
  operations,
  role,
}: {
  lesson: Lesson;
  operations: LessonOperations;
  role: string | null;
}) {
  const queryClient = useQueryClient();
  const [type, setType] = useState("attendance_dispute");
  const [detail, setDetail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const existing = operations.incident;
  const canReport = role === "teacher" || role === "student";

  const mutation = useMutation({
    mutationFn: () => reportLessonIncident(lesson.id, { type, detail }),
    onSuccess: () => {
      setError("");
      setNotice("The issue was reported to the academy.");
      void queryClient.invalidateQueries({
        queryKey: ["lesson-ops", lesson.id],
      });
    },
    onError: (failure) =>
      setError(errorMessage(failure, "Unable to report the issue.")),
  });

  if (!canReport) return null;

  return (
    <Section
      title="Attendance issue"
      icon={<UserX size={19} className="text-foreground opacity-60" />}
    >
      {existing ? (
        <div className="space-y-2">
          <p>
            <span className="font-semibold capitalize">
              {existing.type.replaceAll("_", " ")}
            </span>{" "}
            · <span className="capitalize">{existing.status}</span>
          </p>
          <p className="whitespace-pre-line opacity-75">{existing.detail}</p>
          {existing.resolutionNote && (
            <p className="rounded-xl bg-background p-3 opacity-75">
              Academy note: {existing.resolutionNote}
            </p>
          )}
        </div>
      ) : (
        <>
          <p className="text-foreground opacity-70">
            If the attendance record does not match what happened, report it.
            The academy reviews every report.
          </p>
          {notice && <Notice>{notice}</Notice>}
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setError("");
              setNotice("");
              if (detail.trim().length < 5) {
                setError("Describe the issue in at least 5 characters.");
                return;
              }
              mutation.mutate();
            }}
            className="space-y-3"
          >
            <SelectField
              value={type}
              onChange={setType}
              options={incidentTypes}
              disabled={mutation.isPending}
            />
            <textarea
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="What went wrong?"
              className={inputClass}
              disabled={mutation.isPending}
            />
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-card-border px-5 py-2.5 font-semibold transition hover:border-green-500 disabled:opacity-50"
            >
              {mutation.isPending && (
                <Loader2 size={16} className="animate-spin" />
              )}
              Report to the academy
            </button>
          </form>
        </>
      )}
    </Section>
  );
}

/** All post-booking lesson actions: cancellation, reschedule, make-up, attendance. */
export function LessonOperationsPanel({
  lesson,
  role,
}: {
  lesson: Lesson;
  role?: string | null;
}) {
  const { profile } = useAuth();
  const operationsQuery = useQuery({
    queryKey: ["lesson-ops", lesson.id],
    queryFn: () => getLessonOperations(lesson.id),
    enabled: !!lesson.id,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });

  const operations = operationsQuery.data;

  // The operations response refreshes on its own; keep the panel mounted while
  // a mutation invalidates it so the form does not disappear mid-action.
  const stable = useMemo(() => operations, [operations]);

  if (operationsQuery.isLoading) {
    return (
      <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-6 text-sm text-foreground opacity-70">
        Loading lesson details…
      </div>
    );
  }

  if (operationsQuery.isError || !stable) {
    return (
      <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-6 text-sm">
        <p className="text-foreground opacity-70">
          Lesson management details could not be loaded.
          <button
            type="button"
            onClick={() => void operationsQuery.refetch()}
            className="ml-2 font-semibold text-green-600 dark:text-green-400 hover:underline"
          >
            Retry
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-foreground opacity-60">
        <Clock3 size={15} /> Lesson management updates automatically.
      </div>
      <CancellationSection
        lesson={lesson}
        operations={stable}
        role={role ?? null}
      />
      {lesson.status !== "cancelled" && (
        <RescheduleSection
          lesson={lesson}
          operations={stable}
          role={role ?? null}
          viewerId={profile?.id}
        />
      )}
      <MakeupSection lesson={lesson} operations={stable} role={role ?? null} />
      <AttendanceSection
        lesson={lesson}
        operations={stable}
        viewerId={profile?.id}
        role={role ?? null}
      />
      <ExcuseSection lesson={lesson} operations={stable} role={role ?? null} />
      <IncidentSection
        lesson={lesson}
        operations={stable}
        role={role ?? null}
      />
    </div>
  );
}
