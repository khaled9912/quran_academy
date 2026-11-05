"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import { ApiError } from "@/lib/backend-client";
import {
  adjustStudentCredits,
  approveExcuseRequest,
  approveTeacherHours,
  createTeacherPenalty,
  rejectExcuseRequest,
  rejectTeacherHours,
  resolveLessonIncident,
  resolveReliabilityEvent,
  reviewTeacherPenalty,
  updateSalaryPeriod,
} from "@/services/lesson.service";
import { SelectField } from "@/components/ui/select-field";
import type {
  AttendanceInterval,
  AttendanceSummary,
  ExcuseRequest,
  LessonIncident,
  ReliabilityEvent,
  SalaryPeriod,
  TeacherHours,
  TeacherPenalty,
} from "@/types/lesson";

const inputClass =
  "w-full rounded-xl border border-card-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-green-500";

const dateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const time = (value: string) =>
  new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback;

function ErrorNotice({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
    >
      {children}
    </p>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
      <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
      {children}
    </p>
  );
}

export function AttendanceList({
  attendance,
  intervals,
}: {
  attendance: AttendanceSummary;
  intervals?: AttendanceInterval[];
}) {
  return (
    <div className="space-y-3">
      {attendance.participants.map((participant) => (
        <div
          key={participant.userId}
          className="rounded-xl border border-card-border bg-background p-3 text-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">
              {participant.name}{" "}
              <span className="text-xs font-normal capitalize opacity-60">
                ({participant.role})
              </span>
            </p>
            <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-300">
              {Math.round(participant.totalSeconds / 60)} min
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
        </div>
      ))}
      {intervals && intervals.length > 0 && (
        <details className="rounded-xl border border-card-border p-3 text-sm">
          <summary className="cursor-pointer font-semibold">
            Join intervals ({intervals.length})
          </summary>
          <ul className="mt-2 space-y-1 text-xs text-foreground opacity-70">
            {intervals.map((interval) => (
              <li key={interval.id}>
                {time(interval.joinedAt)} –{" "}
                {interval.leftAt ? time(interval.leftAt) : "open"} ·{" "}
                {Math.round(interval.seconds / 60)} min · device{" "}
                {interval.deviceId.slice(0, 8)}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

export function HoursReview({
  hours,
  onChanged,
}: {
  hours: TeacherHours;
  onChanged: () => void;
}) {
  const [minutes, setMinutes] = useState(String(hours.proposedPayableMinutes));
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const approve = useMutation({
    mutationFn: () =>
      approveTeacherHours(hours.id, {
        approvedMinutes: Number(minutes),
        note,
      }),
    onSuccess: () => {
      setError("");
      setNotice("Hours approved.");
      onChanged();
    },
    onError: (failure) =>
      setError(errorMessage(failure, "Unable to approve these hours.")),
  });
  const reject = useMutation({
    mutationFn: () => rejectTeacherHours(hours.id, note),
    onSuccess: () => {
      setError("");
      setNotice("Hours rejected.");
      onChanged();
    },
    onError: (failure) =>
      setError(errorMessage(failure, "Unable to reject these hours.")),
  });
  const busy = approve.isPending || reject.isPending;

  return (
    <div className="rounded-xl border border-card-border bg-background p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">
            {hours.teacherName} · {hours.studentName}
          </p>
          <p className="text-xs text-foreground opacity-60">
            {dateTime(hours.startsAt)} · lesson {hours.lessonStatus}
          </p>
        </div>
        <span className="rounded-full border border-card-border px-2.5 py-0.5 text-xs font-semibold capitalize">
          {hours.approvalStatus}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide opacity-60">
            Scheduled
          </dt>
          <dd>{hours.scheduledMinutes} min</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide opacity-60">Actual</dt>
          <dd>{hours.actualAttendanceMinutes} min</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide opacity-60">
            Proposed
          </dt>
          <dd>{hours.proposedPayableMinutes} min</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide opacity-60">
            Approved
          </dt>
          <dd>{hours.approvedPayableMinutes ?? "—"}</dd>
        </div>
      </dl>
      {notice && (
        <div className="mt-3">
          <Notice>{notice}</Notice>
        </div>
      )}
      {error && (
        <div className="mt-3">
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="block w-28">
          <span className="mb-1 block text-xs font-semibold">Minutes</span>
          <input
            type="number"
            min={0}
            max={hours.scheduledMinutes}
            value={minutes}
            onChange={(event) => setMinutes(event.target.value)}
            className={inputClass}
            disabled={busy}
          />
        </label>
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Adjustment note (optional)"
          className={`${inputClass} min-w-[12rem] flex-1`}
          disabled={busy}
        />
        <button
          type="button"
          onClick={() => approve.mutate()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 font-semibold text-white hover:bg-green-600 disabled:opacity-50"
        >
          {approve.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <ThumbsUp size={14} />
          )}
          Approve
        </button>
        <button
          type="button"
          onClick={() => reject.mutate()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-card-border px-3 py-2 font-semibold hover:border-red-500 disabled:opacity-50"
        >
          <ThumbsDown size={14} /> Reject
        </button>
      </div>
    </div>
  );
}

const incidentActions = [
  { value: "student_no_show", label: "Student no-show" },
  { value: "teacher_no_show", label: "Teacher no-show" },
  { value: "both_absent", label: "Both absent" },
  { value: "dismissed", label: "Dismiss (no action)" },
];

export function IncidentReview({
  incident,
  onChanged,
}: {
  incident: LessonIncident;
  onChanged: () => void;
}) {
  const [action, setAction] = useState("student_no_show");
  const [note, setNote] = useState("");
  const [payable, setPayable] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      resolveLessonIncident(incident.id, {
        action: action as
          | "student_no_show"
          | "teacher_no_show"
          | "both_absent"
          | "dismissed",
        note,
        teacherPayableMinutes: payable ? Number(payable) : undefined,
      }),
    onSuccess: () => {
      setError("");
      setNotice("Incident resolved.");
      onChanged();
    },
    onError: (failure) =>
      setError(errorMessage(failure, "Unable to resolve this incident.")),
  });

  const resolved = incident.status !== "open";

  return (
    <div className="rounded-xl border border-card-border bg-background p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold capitalize">
            {incident.type.replaceAll("_", " ")}
          </p>
          <p className="text-xs text-foreground opacity-60">
            {incident.teacherName} with {incident.studentName} ·{" "}
            {dateTime(incident.startsAt)}
          </p>
        </div>
        <span className="rounded-full border border-card-border px-2.5 py-0.5 text-xs font-semibold capitalize">
          {incident.status}
        </span>
      </div>
      <p className="mt-2 whitespace-pre-line opacity-75">{incident.detail}</p>
      {incident.resolutionNote && (
        <p className="mt-2 text-xs opacity-60">
          Resolution: {incident.resolutionNote}
        </p>
      )}
      {!resolved && (
        <>
          {notice && (
            <div className="mt-3">
              <Notice>{notice}</Notice>
            </div>
          )}
          {error && (
            <div className="mt-3">
              <ErrorNotice>{error}</ErrorNotice>
            </div>
          )}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <SelectField
              value={action}
              onChange={setAction}
              options={incidentActions}
              size="sm"
              disabled={mutation.isPending}
            />
            {action === "student_no_show" && (
              <input
                type="number"
                min={0}
                value={payable}
                onChange={(event) => setPayable(event.target.value)}
                placeholder="Teacher payable minutes (optional)"
                className={inputClass}
                disabled={mutation.isPending}
              />
            )}
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Resolution note"
              className={`${inputClass} sm:col-span-2`}
              disabled={mutation.isPending}
            />
          </div>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-green-500 px-3 py-2 font-semibold text-white hover:bg-green-600 disabled:opacity-50"
          >
            {mutation.isPending && (
              <Loader2 size={14} className="animate-spin" />
            )}
            Resolve incident
          </button>
        </>
      )}
    </div>
  );
}

export function ExcuseReview({
  excuse,
  onChanged,
}: {
  excuse: ExcuseRequest;
  onChanged: () => void;
}) {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const approve = useMutation({
    mutationFn: () => approveExcuseRequest(excuse.id, note),
    onSuccess: () => {
      setError("");
      setNotice("Excuse approved. The student credit was restored.");
      onChanged();
    },
    onError: (failure) =>
      setError(errorMessage(failure, "Unable to approve this excuse.")),
  });
  const reject = useMutation({
    mutationFn: () => rejectExcuseRequest(excuse.id, note),
    onSuccess: () => {
      setError("");
      setNotice("Excuse rejected.");
      onChanged();
    },
    onError: (failure) =>
      setError(errorMessage(failure, "Unable to reject this excuse.")),
  });
  const busy = approve.isPending || reject.isPending;
  const pending = excuse.status === "pending";

  return (
    <div className="rounded-xl border border-card-border bg-background p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold capitalize">
            {excuse.studentName} · {excuse.category.replaceAll("_", " ")}
          </p>
          <p className="text-xs text-foreground opacity-60">
            Lesson {dateTime(excuse.startsAt)}
          </p>
        </div>
        <span className="rounded-full border border-card-border px-2.5 py-0.5 text-xs font-semibold capitalize">
          {excuse.status}
        </span>
      </div>
      <p className="mt-2 whitespace-pre-line opacity-75">
        {excuse.explanation}
      </p>
      {excuse.adminNote && (
        <p className="mt-2 text-xs opacity-60">Note: {excuse.adminNote}</p>
      )}
      {pending && (
        <>
          {notice && (
            <div className="mt-3">
              <Notice>{notice}</Notice>
            </div>
          )}
          {error && (
            <div className="mt-3">
              <ErrorNotice>{error}</ErrorNotice>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional note to the student"
              className={`${inputClass} min-w-[12rem] flex-1`}
              disabled={busy}
            />
            <button
              type="button"
              onClick={() => approve.mutate()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 font-semibold text-white hover:bg-green-600 disabled:opacity-50"
            >
              {approve.isPending && (
                <Loader2 size={14} className="animate-spin" />
              )}
              Approve
            </button>
            <button
              type="button"
              onClick={() => reject.mutate()}
              disabled={busy}
              className="rounded-lg border border-card-border px-3 py-2 font-semibold hover:border-red-500 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function CreditAdjust({
  studentId,
  balance,
  onChanged,
}: {
  studentId: string;
  balance?: number;
  onChanged: () => void;
}) {
  const [amount, setAmount] = useState("1");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      adjustStudentCredits(studentId, {
        amount: Number(amount),
        reason,
      }),
    onSuccess: () => {
      setError("");
      setReason("");
      setNotice("Credit adjustment saved.");
      onChanged();
    },
    onError: (failure) =>
      setError(errorMessage(failure, "Unable to adjust credits.")),
  });

  return (
    <div className="rounded-xl border border-card-border bg-background p-3 text-sm">
      <p className="font-semibold">
        Student credits{balance != null ? ` · balance ${balance}` : ""}
      </p>
      {notice && (
        <div className="mt-2">
          <Notice>{notice}</Notice>
        </div>
      )}
      {error && (
        <div className="mt-2">
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          type="number"
          min={-50}
          max={50}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className={`${inputClass} w-24`}
          disabled={mutation.isPending}
        />
        <input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Reason (at least 5 characters)"
          className={`${inputClass} min-w-[12rem] flex-1`}
          disabled={mutation.isPending}
        />
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg border border-card-border px-3 py-2 font-semibold hover:border-green-500 disabled:opacity-50"
        >
          {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
          Adjust
        </button>
      </div>
    </div>
  );
}

export function PenaltyCreate({
  teacherId,
  lessonId,
  onChanged,
}: {
  teacherId: string;
  lessonId?: string;
  onChanged: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      createTeacherPenalty({
        teacherId,
        lessonId,
        eventType: "manual",
        amountEgp: Number(amount),
        reason,
      }),
    onSuccess: () => {
      setError("");
      setAmount("");
      setReason("");
      setNotice("Penalty proposed. It is not deducted until it is approved.");
      onChanged();
    },
    onError: (failure) =>
      setError(errorMessage(failure, "Unable to create the penalty.")),
  });

  return (
    <div className="rounded-xl border border-card-border bg-background p-3 text-sm">
      <p className="font-semibold">Propose a teacher penalty</p>
      {notice && (
        <div className="mt-2">
          <Notice>{notice}</Notice>
        </div>
      )}
      {error && (
        <div className="mt-2">
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          type="number"
          min={0}
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="EGP"
          className={`${inputClass} w-28`}
          disabled={mutation.isPending}
        />
        <input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Reason (at least 5 characters)"
          className={`${inputClass} min-w-[12rem] flex-1`}
          disabled={mutation.isPending}
        />
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg border border-card-border px-3 py-2 font-semibold hover:border-green-500 disabled:opacity-50"
        >
          {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
          Add
        </button>
      </div>
    </div>
  );
}

export function PenaltyReview({
  penalty,
  onChanged,
}: {
  penalty: TeacherPenalty;
  onChanged: () => void;
}) {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const review = useMutation({
    mutationFn: (status: "approved" | "rejected") =>
      reviewTeacherPenalty(penalty.id, { status, note }),
    onSuccess: onChanged,
    onError: (failure) =>
      setError(errorMessage(failure, "Unable to review the penalty.")),
  });

  return (
    <div className="rounded-xl border border-card-border bg-background p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">
            {penalty.teacherName} · {penalty.amountEgp.toFixed(2)} EGP
          </p>
          <p className="text-xs text-foreground opacity-60">
            {penalty.reason} · {dateTime(penalty.createdAt)}
          </p>
        </div>
        <span className="rounded-full border border-card-border px-2.5 py-0.5 text-xs font-semibold capitalize">
          {penalty.status}
        </span>
      </div>
      {error && (
        <div className="mt-2">
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      )}
      {penalty.status === "pending" && (
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Review note"
            className={`${inputClass} min-w-[10rem] flex-1`}
            disabled={review.isPending}
          />
          <button
            type="button"
            onClick={() => review.mutate("approved")}
            disabled={review.isPending}
            className="rounded-lg bg-green-500 px-3 py-2 font-semibold text-white hover:bg-green-600 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => review.mutate("rejected")}
            disabled={review.isPending}
            className="rounded-lg border border-card-border px-3 py-2 font-semibold hover:border-red-500 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export function ReliabilityCard({
  event,
  onChanged,
}: {
  event: ReliabilityEvent;
  onChanged: () => void;
}) {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      resolveReliabilityEvent(event.id, { note, action: "reviewed" }),
    onSuccess: onChanged,
    onError: (failure) =>
      setError(errorMessage(failure, "Unable to update this event.")),
  });

  return (
    <div className="rounded-xl border border-card-border bg-background p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold capitalize">
            {event.type.replaceAll("_", " ")}
          </p>
          <p className="text-xs text-foreground opacity-60">
            {event.userName} · {event.role} · {dateTime(event.createdAt)}
          </p>
        </div>
        <span className="rounded-full border border-card-border px-2.5 py-0.5 text-xs font-semibold">
          {event.resolvedAt ? "resolved" : "open"}
        </span>
      </div>
      {event.notes && <p className="mt-2 opacity-75">{event.notes}</p>}
      {event.resolutionNote && (
        <p className="mt-2 text-xs opacity-60">
          Resolution: {event.resolutionNote}
        </p>
      )}
      {error && (
        <div className="mt-2">
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      )}
      {!event.resolvedAt && (
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Review note"
            className={`${inputClass} min-w-[10rem] flex-1`}
            disabled={mutation.isPending}
          />
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-card-border px-3 py-2 font-semibold hover:border-green-500 disabled:opacity-50"
          >
            {mutation.isPending && (
              <Loader2 size={14} className="animate-spin" />
            )}
            Mark reviewed
          </button>
        </div>
      )}
    </div>
  );
}

const salaryStatuses = [
  { value: "open", label: "Open" },
  { value: "reviewed", label: "Reviewed" },
  { value: "paid", label: "Paid" },
];

export function SalaryCard({
  period,
  onChanged,
}: {
  period: SalaryPeriod;
  onChanged: () => void;
}) {
  const [adjustment, setAdjustment] = useState(
    String(period.manualAdjustmentEgp)
  );
  const [finalAmount, setFinalAmount] = useState(
    period.finalAmountEgp != null ? String(period.finalAmountEgp) : ""
  );
  const [notes, setNotes] = useState(period.notes ?? "");
  const [status, setStatus] = useState(period.status);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      updateSalaryPeriod(period.id, {
        manualAdjustmentEgp: Number(adjustment || 0),
        finalAmountEgp: finalAmount ? Number(finalAmount) : undefined,
        notes,
        status: status as "open" | "reviewed" | "paid",
      }),
    onSuccess: () => {
      setError("");
      setNotice("Salary review saved.");
      onChanged();
    },
    onError: (failure) =>
      setError(errorMessage(failure, "Unable to save this salary review.")),
  });

  const locked = period.status === "paid";

  return (
    <div className="rounded-xl border border-card-border bg-background p-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{period.teacherName}</p>
          <p className="text-xs text-foreground opacity-60">{period.month}</p>
        </div>
        <span className="rounded-full border border-card-border px-2.5 py-0.5 text-xs font-semibold capitalize">
          {period.status}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide opacity-60">
            Scheduled
          </dt>
          <dd>{period.totalScheduledMinutes} min</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide opacity-60">Actual</dt>
          <dd>{period.totalActualMinutes} min</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide opacity-60">
            Approved
          </dt>
          <dd>{period.totalApprovedMinutes} min</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide opacity-60">
            Lessons
          </dt>
          <dd>{period.completedLessons}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide opacity-60">
            Penalties
          </dt>
          <dd>{period.approvedPenaltyEgp.toFixed(2)} EGP</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide opacity-60">
            Late cancels
          </dt>
          <dd>{period.studentLateCancellations}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide opacity-60">
            No-shows
          </dt>
          <dd>
            {period.teacherNoShows} teacher / {period.studentNoShows} student
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide opacity-60">
            Pending penalties
          </dt>
          <dd>{period.pendingPenaltyEgp.toFixed(2)} EGP</dd>
        </div>
      </dl>
      {notice && (
        <div className="mt-3">
          <Notice>{notice}</Notice>
        </div>
      )}
      {error && (
        <div className="mt-3">
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      )}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold">
            Manual adjustment (EGP)
          </span>
          <input
            type="number"
            step="0.01"
            value={adjustment}
            onChange={(event) => setAdjustment(event.target.value)}
            className={inputClass}
            disabled={locked || mutation.isPending}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold">
            Final amount (EGP)
          </span>
          <input
            type="number"
            step="0.01"
            value={finalAmount}
            onChange={(event) => setFinalAmount(event.target.value)}
            placeholder="Set after review"
            className={inputClass}
            disabled={locked || mutation.isPending}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold">Notes</span>
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Salary review notes"
            className={inputClass}
            disabled={locked || mutation.isPending}
          />
        </label>
        <div className="sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold">Status</span>
          <SelectField
            value={status}
            onChange={setStatus}
            options={salaryStatuses}
            size="sm"
            disabled={locked || mutation.isPending}
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-foreground opacity-60">
        Final amounts are recorded for review only. The academy performs the
        actual payment outside this system.
      </p>
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={locked || mutation.isPending}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-semibold text-white hover:bg-green-600 disabled:opacity-50"
      >
        {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
        Save salary review
      </button>
    </div>
  );
}
