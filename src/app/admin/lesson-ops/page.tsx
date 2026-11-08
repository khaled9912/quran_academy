"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  Loader2,
  MonitorPlay,
  RefreshCw,
  Scale,
  Settings2,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { ApiError } from "@/lib/backend-client";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";
import {
  generateSalaryPeriods,
  getAdminLessonOps,
  getAdminLessonOpsDetail,
  getAdminTeacherHours,
  getExcuseRequests,
  getLessonIncidents,
  getLessonPolicy,
  getReliabilityEvents,
  getSalaryPeriods,
  getTeacherPenalties,
  updateLessonPolicy,
} from "@/services/lesson.service";
import {
  AttendanceList,
  CreditAdjust,
  ExcuseReview,
  HoursReview,
  IncidentReview,
  PenaltyCreate,
  PenaltyReview,
  ReliabilityCard,
  SalaryCard,
} from "@/components/admin/LessonOpsReviews";
import type {
  AcademyPolicy,
  AdminLessonOpsRow,
  LessonStatus,
} from "@/types/lesson";

type Tab = "day" | "queues" | "pay" | "policy";

const tabs: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: "day", label: "Day monitor", icon: <CalendarDays size={16} /> },
  {
    value: "queues",
    label: "Review queues",
    icon: <ClipboardList size={16} />,
  },
  { value: "pay", label: "Salary review", icon: <Wallet size={16} /> },
  { value: "policy", label: "Policy", icon: <Settings2 size={16} /> },
];

const pad = (value: number) => String(value).padStart(2, "0");

const todayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const monthKey = () => todayKey().slice(0, 7);

const dateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const timeRange = (startsAt: string, endsAt: string) =>
  `${new Date(startsAt).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })} – ${new Date(endsAt).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;

const outcomeLabels: Record<string, string> = {
  free_cancellation: "Free cancellation",
  grace_cancellation: "Grace cancellation",
  late_cancellation: "Late cancellation",
  cancelled_by_teacher: "Teacher cancelled",
  late_cancelled_by_teacher: "Teacher late cancel",
  admin_cancelled: "Academy cancelled",
  student_no_show: "Student no-show",
  teacher_no_show: "Teacher no-show",
  both_absent: "Both absent",
  series_ended: "Weekly lessons ended",
};

const statusStyles: Record<LessonStatus, string> = {
  scheduled: "bg-green-500/10 text-green-700 dark:text-green-400",
  in_progress: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  completed: "bg-foreground/10 text-foreground opacity-70",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-300",
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-card-border bg-card-bg p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[.12em] opacity-60">
        {label}
      </p>
    </div>
  );
}

function phaseOf(row: AdminLessonOpsRow) {
  const { lesson } = row;
  if (lesson.status === "cancelled" || lesson.status === "completed")
    return lesson.status;
  const now = Date.now();
  if (new Date(lesson.endsAt).getTime() <= now) return "ended";
  return new Date(lesson.startsAt).getTime() <= now ? "live" : "upcoming";
}

function DayLessonRow({
  row,
  selected,
  onSelect,
}: {
  row: AdminLessonOpsRow;
  selected: boolean;
  onSelect: () => void;
}) {
  const phase = phaseOf(row);
  const attended = row.attendance.participants.reduce(
    (total, participant) => total + participant.totalSeconds,
    0
  );
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border bg-card-bg p-4 text-left transition ${
        selected
          ? "border-green-500"
          : "border-card-border hover:border-green-400"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">
            {timeRange(row.lesson.startsAt, row.lesson.endsAt)} ·{" "}
            {row.lesson.teacherName ?? "Teacher"}
          </p>
          <p className="mt-0.5 text-sm text-foreground opacity-70">
            with {row.lesson.studentName ?? "Student"}
            {row.lesson.isTrial && " · trial"}
            {row.lesson.isMakeup && " · make-up"}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {phase === "live" && (
            <span className="rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
              Live
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
              statusStyles[row.lesson.status]
            }`}
          >
            {phase === "ended"
              ? "ended"
              : row.lesson.status.replaceAll("_", " ")}
          </span>
          {row.cancellationOutcome && (
            <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:text-red-300">
              {outcomeLabels[row.cancellationOutcome] ??
                row.cancellationOutcome.replaceAll("_", " ")}
            </span>
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-foreground opacity-60">
        <span>Attendance {Math.round(attended / 60)} min total</span>
        {row.pendingReschedule && <span>Reschedule waiting</span>}
        {row.reportDue && <span>Report due</span>}
        {row.hours && (
          <span>
            Hours {row.hours.proposedPayableMinutes} min ·{" "}
            {row.hours.approvalStatus}
          </span>
        )}
        {row.incidents.some((incident) => incident.status === "open") && (
          <span className="text-amber-600 dark:text-amber-400 ">
            Open incident
          </span>
        )}
      </div>
    </button>
  );
}

function DetailPanel({
  lessonId,
  onClose,
  onChanged,
}: {
  lessonId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const detailQuery = useQuery({
    queryKey: ["admin-lesson-ops-detail", lessonId],
    queryFn: () => getAdminLessonOpsDetail(lessonId),
    refetchInterval: LIVE_SYNC_INTERVAL,
  });
  const detail = detailQuery.data;

  return (
    <aside className="rounded-3xl border border-card-border bg-card-bg p-5">
      <div className="mb-4 flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold">Lesson detail</h2>
        <div className="flex items-center gap-2">
          {detail && (
            <Link
              href={`/lesson/${detail.lesson.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-card-border px-2.5 py-1.5 text-xs font-semibold hover:border-green-500"
            >
              <MonitorPlay size={13} /> Open room
            </Link>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-card-border px-2.5 py-1.5 text-xs font-semibold hover:border-green-500"
          >
            Close
          </button>
        </div>
      </div>

      {detailQuery.isLoading ? (
        <p className="text-sm opacity-70">Loading lesson detail…</p>
      ) : detailQuery.isError || !detail ? (
        <p className="text-sm opacity-70">Lesson detail could not be loaded.</p>
      ) : (
        <div className="space-y-5 text-sm">
          <div>
            <p className="font-semibold">
              {detail.lesson.teacherName} with {detail.lesson.studentName}
            </p>
            <p className="text-xs text-foreground opacity-60">
              {dateTime(detail.lesson.startsAt)} ·{" "}
              {detail.lesson.status.replaceAll("_", " ")}
              {detail.lesson.isMakeup && " · make-up"}
              {detail.lesson.isTrial && " · trial"}
            </p>
            {detail.cancellation && (
              <p className="mt-2 rounded-xl bg-red-500/10 p-2.5 text-xs text-red-700 dark:text-red-300">
                {outcomeLabels[detail.cancellation.outcome] ??
                  detail.cancellation.outcome}{" "}
                · {detail.cancellation.hoursBefore.toFixed(1)}h notice ·{" "}
                {detail.cancellation.teacherPayableMinutes} teacher min
                {detail.cancellation.reason
                  ? ` · ${detail.cancellation.reason}`
                  : ""}
              </p>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-[.12em] opacity-60">
              Attendance
            </h3>
            <AttendanceList
              attendance={detail.attendance}
              intervals={detail.intervals}
            />
          </div>

          {detail.rescheduleRequests.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-[.12em] opacity-60">
                Reschedule requests
              </h3>
              <ul className="space-y-1.5 text-xs">
                {detail.rescheduleRequests.map((request) => (
                  <li
                    key={request.id}
                    className="rounded-lg border border-card-border p-2"
                  >
                    {dateTime(request.proposedStartsAt)} · {request.status} ·{" "}
                    {request.requestedByName}
                    {request.responseNote ? ` · ${request.responseNote}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {detail.hours && (
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-[.12em] opacity-60">
                Teacher hours
              </h3>
              <HoursReview hours={detail.hours} onChanged={onChanged} />
            </div>
          )}

          {detail.incidents.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-[.12em] opacity-60">
                Incidents
              </h3>
              <div className="space-y-2">
                {detail.incidents.map((incident) => (
                  <IncidentReview
                    key={incident.id}
                    incident={incident}
                    onChanged={onChanged}
                  />
                ))}
              </div>
            </div>
          )}

          {detail.excuse && (
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-[.12em] opacity-60">
                Excuse request
              </h3>
              <ExcuseReview excuse={detail.excuse} onChanged={onChanged} />
            </div>
          )}

          {detail.credits.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-[.12em] opacity-60">
                Credit ledger
              </h3>
              <ul className="space-y-1.5 text-xs">
                {detail.credits.map((credit) => (
                  <li
                    key={credit.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-card-border p-2"
                  >
                    <span>
                      {credit.reason} · {credit.type.replaceAll("_", " ")}
                    </span>
                    <span
                      className={
                        credit.amount < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }
                    >
                      {credit.amount > 0 ? "+" : ""}
                      {credit.amount}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {detail.scheduleChanges.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-[.12em] opacity-60">
                Schedule changes
              </h3>
              <ul className="space-y-1.5 text-xs">
                {detail.scheduleChanges.map((change) => (
                  <li
                    key={change.id}
                    className="rounded-lg border border-card-border p-2"
                  >
                    {dateTime(change.fromStartsAt)} →{" "}
                    {dateTime(change.toStartsAt)}
                    {change.reason ? ` · ${change.reason}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <CreditAdjust
            studentId={detail.lesson.studentId}
            onChanged={onChanged}
          />
          <PenaltyCreate
            teacherId={detail.lesson.teacherId}
            lessonId={detail.lesson.id}
            onChanged={onChanged}
          />
        </div>
      )}
    </aside>
  );
}

const policyFields: {
  key: keyof Pick<
    AcademyPolicy,
    | "studentFreeCancelHours"
    | "teacherFreeCancelHours"
    | "noShowGraceMinutes"
    | "rescheduleResponseHours"
    | "studentGraceCancellationsPerMonth"
    | "studentWarningStrikeThreshold"
    | "studentAdminReviewStrikeThreshold"
    | "teacherAdminReviewStrikeThreshold"
    | "trialNoShowThreshold"
  >;
  label: string;
}[] = [
  { key: "studentFreeCancelHours", label: "Student free cancellation (hours)" },
  { key: "teacherFreeCancelHours", label: "Teacher free cancellation (hours)" },
  { key: "noShowGraceMinutes", label: "No-show grace (minutes)" },
  { key: "rescheduleResponseHours", label: "Reschedule reply window (hours)" },
  {
    key: "studentGraceCancellationsPerMonth",
    label: "Student grace cancellations per month",
  },
  { key: "studentWarningStrikeThreshold", label: "Student warning threshold" },
  {
    key: "studentAdminReviewStrikeThreshold",
    label: "Student admin-review threshold",
  },
  {
    key: "teacherAdminReviewStrikeThreshold",
    label: "Teacher admin-review threshold",
  },
  { key: "trialNoShowThreshold", label: "Trial no-show threshold" },
];

function PolicyForm({ policy }: { policy: AcademyPolicy }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      policyFields.map((field) => [field.key, String(policy[field.key])])
    )
  );
  const [payScheduled, setPayScheduled] = useState(
    policy.payScheduledDurationWhenAttended
  );

  const mutation = useMutation({
    mutationFn: () => {
      const payload: Partial<AcademyPolicy> = {
        payScheduledDurationWhenAttended: payScheduled,
      };
      for (const field of policyFields) {
        payload[field.key] = Number(values[field.key]);
      }
      return updateLessonPolicy(payload);
    },
    onSuccess: (saved) => {
      showToast("Policy updated.", "success");
      queryClient.setQueryData(["lesson-policy"], saved);
    },
    onError: (failure) => {
      if (!(failure instanceof ApiError)) {
        showToast("Unable to save the policy.", "error");
      }
    },
  });

  return (
    <div className="rounded-3xl border border-card-border bg-card-bg p-6">
      <p className="text-sm text-foreground opacity-70">
        These rules are enforced by the API for web and mobile. Changing them
        affects cancellations, reschedules, no-show review, and teacher hours
        immediately.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
        className="mt-5 space-y-4"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {policyFields.map((field) => (
            <label key={field.key} className="block">
              <span className="mb-1 block text-sm font-semibold">
                {field.label}
              </span>
              <input
                type="number"
                min={0}
                max={720}
                value={values[field.key] ?? ""}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [field.key]: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-card-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-green-500"
                disabled={mutation.isPending}
              />
            </label>
          ))}
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={payScheduled}
            onChange={(event) => setPayScheduled(event.target.checked)}
            className="mt-1"
            disabled={mutation.isPending}
          />
          <span>
            Pay the scheduled duration when the teacher attended and the student
            did not
          </span>
        </label>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 font-semibold text-white hover:bg-green-600 disabled:opacity-50"
        >
          {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
          Save policy
        </button>
      </form>
    </div>
  );
}

export default function AdminLessonOpsPage() {
  const { role } = useAuth();
  const canManage = role === "admin" || role === "super_admin";
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("day");
  const [date, setDate] = useState(todayKey);
  const [month, setMonth] = useState(monthKey);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const dayQuery = useQuery({
    queryKey: ["admin-lesson-ops", date],
    queryFn: () => getAdminLessonOps(date),
    enabled: canManage,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });
  const excusesQuery = useQuery({
    queryKey: ["admin-excuses"],
    queryFn: () => getExcuseRequests("pending"),
    enabled: canManage && tab === "queues",
  });
  const incidentsQuery = useQuery({
    queryKey: ["admin-incidents"],
    queryFn: () => getLessonIncidents("open"),
    enabled: canManage && tab === "queues",
  });
  const hoursQuery = useQuery({
    queryKey: ["admin-hours", month],
    queryFn: () => getAdminTeacherHours(`?status=pending&month=${month}`),
    enabled: canManage && tab === "queues",
  });
  const reliabilityQuery = useQuery({
    queryKey: ["admin-reliability"],
    queryFn: () => getReliabilityEvents(""),
    enabled: canManage && tab === "queues",
  });
  const penaltiesQuery = useQuery({
    queryKey: ["admin-penalties"],
    queryFn: () => getTeacherPenalties("pending"),
    enabled: canManage && tab === "queues",
  });
  const salaryQuery = useQuery({
    queryKey: ["admin-salary", month],
    queryFn: () => getSalaryPeriods(month),
    enabled: canManage && tab === "pay",
  });
  const policyQuery = useQuery({
    queryKey: ["lesson-policy"],
    queryFn: getLessonPolicy,
    enabled: canManage && tab === "policy",
  });

  const refreshDay = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-lesson-ops"] });
    if (selectedId) {
      void queryClient.invalidateQueries({
        queryKey: ["admin-lesson-ops-detail", selectedId],
      });
    }
  };

  const refreshQueues = () => {
    for (const key of [
      "admin-excuses",
      "admin-incidents",
      "admin-hours",
      "admin-reliability",
      "admin-penalties",
    ]) {
      void queryClient.invalidateQueries({ queryKey: [key] });
    }
    void queryClient.invalidateQueries({ queryKey: ["admin-lesson-ops"] });
    if (selectedId) {
      void queryClient.invalidateQueries({
        queryKey: ["admin-lesson-ops-detail", selectedId],
      });
    }
  };

  const generateSalaries = useMutation({
    mutationFn: () => generateSalaryPeriods(month),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-salary"] });
    },
  });

  if (!canManage) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Admin access is required for lesson operations.
      </main>
    );
  }

  const summary = dayQuery.data?.summary;
  const openReliability =
    reliabilityQuery.data?.filter((event) => !event.resolvedAt) ?? [];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 text-foreground">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/admin/dashboard"
              className="mb-3 inline-block text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-400"
            >
              ← Back to admin dashboard
            </Link>
            <h1 className="text-4xl font-bold">Lesson operations</h1>
            <p className="mt-1 text-lg text-foreground opacity-75">
              Attendance, cancellations, reschedules, no-shows, teacher hours,
              and salary review in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-3 py-2 text-sm">
              <span className="font-semibold opacity-70">Day</span>
              <input
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setSelectedId(null);
                }}
                className="bg-transparent text-foreground focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => void dayQuery.refetch()}
              className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold hover:border-green-500"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              aria-pressed={tab === item.value}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                tab === item.value
                  ? "bg-green-500 text-white"
                  : "border border-card-border bg-card-bg hover:border-green-500"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {tab === "day" && (
          <>
            {dayQuery.isLoading ? (
              <p className="text-foreground opacity-70">Loading the day…</p>
            ) : dayQuery.isError ? (
              <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-8 text-center">
                <p className="opacity-70">
                  Lesson operations could not be loaded.
                </p>
                <button
                  type="button"
                  onClick={() => void dayQuery.refetch()}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm font-semibold hover:border-green-500"
                >
                  <RefreshCw size={15} /> Retry
                </button>
              </div>
            ) : (
              <>
                {summary && (
                  <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <Stat label="Lessons" value={summary.lessons} />
                    <Stat label="Live now" value={summary.liveNow} />
                    <Stat label="Upcoming" value={summary.upcoming} />
                    <Stat label="Reports due" value={summary.pendingReports} />
                    <Stat
                      label="No attendance"
                      value={summary.missingAttendance}
                    />
                    <Stat
                      label="Reschedules"
                      value={summary.pendingReschedules}
                    />
                    <Stat label="Excuses" value={summary.pendingExcuses} />
                    <Stat
                      label="No-show incidents"
                      value={summary.noShowIncidents}
                    />
                    <Stat label="Hours pending" value={summary.pendingHours} />
                  </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                  <div className="space-y-3">
                    {dayQuery.data?.lessons.length ? (
                      dayQuery.data.lessons.map((row) => (
                        <DayLessonRow
                          key={row.lesson.id}
                          row={row}
                          selected={selectedId === row.lesson.id}
                          onSelect={() => setSelectedId(row.lesson.id)}
                        />
                      ))
                    ) : (
                      <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-8 text-center opacity-70">
                        No lessons on {dayQuery.data?.date ?? date}.
                      </div>
                    )}
                  </div>
                  {selectedId ? (
                    <DetailPanel
                      key={selectedId}
                      lessonId={selectedId}
                      onClose={() => setSelectedId(null)}
                      onChanged={refreshDay}
                    />
                  ) : (
                    <aside className="rounded-3xl border border-dashed border-card-border bg-card-bg p-6 text-sm text-foreground opacity-70">
                      Select a lesson to inspect attendance intervals, review
                      cancellations, approve teacher hours, resolve incidents,
                      or adjust student credits.
                    </aside>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {tab === "queues" && (
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
                <AlertTriangle
                  size={20}
                  className="text-amber-600 dark:text-amber-400"
                />
                Excuse requests
              </h2>
              {excusesQuery.isLoading ? (
                <p className="text-sm opacity-70">Loading…</p>
              ) : excusesQuery.data?.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {excusesQuery.data.map((excuse) => (
                    <ExcuseReview
                      key={excuse.id}
                      excuse={excuse}
                      onChanged={refreshQueues}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-card-border bg-card-bg p-5 text-sm opacity-70">
                  No excuse requests are waiting.
                </p>
              )}
            </section>

            <section>
              <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
                <AlertTriangle
                  size={20}
                  className="text-red-600 dark:text-red-400"
                />
                Attendance incidents
              </h2>
              {incidentsQuery.isLoading ? (
                <p className="text-sm opacity-70">Loading…</p>
              ) : incidentsQuery.data?.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {incidentsQuery.data.map((incident) => (
                    <IncidentReview
                      key={incident.id}
                      incident={incident}
                      onChanged={refreshQueues}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-card-border bg-card-bg p-5 text-sm opacity-70">
                  No open attendance incidents.
                </p>
              )}
            </section>

            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-2xl font-semibold">
                  <Scale
                    size={20}
                    className="text-green-600 dark:text-green-400"
                  />
                  Teacher hours
                </h2>
                <input
                  type="month"
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  className="rounded-xl border border-card-border bg-card-bg px-3 py-2 text-sm"
                />
              </div>
              {hoursQuery.isLoading ? (
                <p className="text-sm opacity-70">Loading…</p>
              ) : hoursQuery.data?.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {hoursQuery.data.map((hours) => (
                    <HoursReview
                      key={hours.id}
                      hours={hours}
                      onChanged={refreshQueues}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-card-border bg-card-bg p-5 text-sm opacity-70">
                  No pending teacher hours for {month}.
                </p>
              )}
            </section>

            <section>
              <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
                <Scale
                  size={20}
                  className="text-amber-600 dark:text-amber-400"
                />
                Reliability events
              </h2>
              {reliabilityQuery.isLoading ? (
                <p className="text-sm opacity-70">Loading…</p>
              ) : openReliability.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {openReliability.map((event) => (
                    <ReliabilityCard
                      key={event.id}
                      event={event}
                      onChanged={refreshQueues}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-card-border bg-card-bg p-5 text-sm opacity-70">
                  No reliability events need review.
                </p>
              )}
            </section>

            <section>
              <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
                <AlertTriangle
                  size={20}
                  className="text-red-600 dark:text-red-400"
                />
                Proposed penalties
              </h2>
              {penaltiesQuery.isLoading ? (
                <p className="text-sm opacity-70">Loading…</p>
              ) : penaltiesQuery.data?.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {penaltiesQuery.data.map((penalty) => (
                    <PenaltyReview
                      key={penalty.id}
                      penalty={penalty}
                      onChanged={refreshQueues}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-card-border bg-card-bg p-5 text-sm opacity-70">
                  No penalties are waiting for review.
                </p>
              )}
            </section>
          </div>
        )}

        {tab === "pay" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3 rounded-3xl border border-card-border bg-card-bg p-5">
              <div>
                <h2 className="text-xl font-semibold">Monthly salary review</h2>
                <p className="mt-1 text-sm text-foreground opacity-70">
                  Periods collect approved minutes, penalties, and reliability
                  counts. Set the final amount manually; no payment is sent from
                  this system.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="month"
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  className="rounded-xl border border-card-border bg-background px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => generateSalaries.mutate()}
                  disabled={generateSalaries.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
                >
                  {generateSalaries.isPending && (
                    <Loader2 size={15} className="animate-spin" />
                  )}
                  Generate / refresh
                </button>
              </div>
            </div>

            {salaryQuery.isLoading ? (
              <p className="text-sm opacity-70">Loading salary periods…</p>
            ) : salaryQuery.data?.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {salaryQuery.data.map((period) => (
                  <SalaryCard
                    key={period.id}
                    period={period}
                    onChanged={() =>
                      void queryClient.invalidateQueries({
                        queryKey: ["admin-salary"],
                      })
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-3xl border border-dashed border-card-border bg-card-bg p-8 text-center text-sm opacity-70">
                No salary periods for {month}. Generate them after the month’s
                lessons have been reviewed.
              </p>
            )}
          </div>
        )}

        {tab === "policy" && (
          <div>
            {policyQuery.isLoading ? (
              <p className="text-sm opacity-70">Loading policy…</p>
            ) : policyQuery.data ? (
              <PolicyForm policy={policyQuery.data} />
            ) : (
              <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-8 text-center text-sm opacity-70">
                Policy could not be loaded.
                <button
                  type="button"
                  onClick={() => void policyQuery.refetch()}
                  className="ml-2 font-semibold text-green-600 dark:text-green-400 hover:underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
