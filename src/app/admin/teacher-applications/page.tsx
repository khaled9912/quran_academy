"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Mic,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { teacherSubjectLabel } from "@/lib/teacher-subjects";
import {
  downloadTeacherApplicationCv,
  downloadTeacherApplicationIntro,
  downloadTeacherApplicationQuran,
  getTeacherApplications,
  reviewTeacherApplication,
} from "@/services/teacher-application.service";
import {
  englishLevelLabel,
  type TeacherApplication,
  type TeacherApplicationStatus,
} from "@/types/teacher-application";

const statusStyles: Record<TeacherApplicationStatus, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  approved: "bg-green-500/15 text-green-700 dark:text-green-400",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const filters: Array<{
  value: TeacherApplicationStatus | "all";
  label: string;
}> = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

const formatDate = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
  });

export default function AdminTeacherApplicationsPage() {
  const { role } = useAuth();
  const canManage = role === "admin" || role === "super_admin";
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<TeacherApplicationStatus | "all">(
    "pending"
  );
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const applicationsQuery = useQuery({
    queryKey: ["teacher-applications", filter],
    queryFn: () => getTeacherApplications(filter),
    enabled: canManage,
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: "approved" | "rejected";
      reason?: string;
    }) => reviewTeacherApplication(id, { status, reason }),
    onSuccess: async (result) => {
      setActionError("");
      setRejectingId(null);
      setRejectReason("");
      if (result.inviteCode) {
        setNotice(
          `Approved. Invite code: ${result.inviteCode} (valid for 15 minutes). Share it with the teacher so they can set a password.`
        );
      } else if (result.inviteEmailed) {
        setNotice("Approved. The invitation email was sent to the teacher.");
      } else {
        setNotice(
          result.application.status === "rejected"
            ? "Application rejected."
            : "Application approved. Ask the teacher to use Forgot password to get a code."
        );
      }
      await queryClient.invalidateQueries({
        queryKey: ["teacher-applications"],
      });
    },
    onError: (error) => {
      setNotice("");
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to update the application."
      );
    },
  });

  const downloadFile = async (
    application: TeacherApplication,
    kind: "cv" | "intro" | "quran"
  ) => {
    setDownloadingKey(`${application.id}:${kind}`);
    setActionError("");
    try {
      const blob =
        kind === "cv"
          ? await downloadTeacherApplicationCv(application.id)
          : kind === "intro"
            ? await downloadTeacherApplicationIntro(application.id)
            : await downloadTeacherApplicationQuran(application.id);
      const fallback =
        kind === "cv"
          ? "teacher-cv.pdf"
          : kind === "intro"
            ? "self-introduction.webm"
            : "quran-recitation.webm";
      const fileName =
        (kind === "cv"
          ? application.cvFileName
          : kind === "intro"
            ? application.introFileName
            : application.quranRecordingFileName) ?? fallback;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : `Unable to download the ${kind === "cv" ? "CV" : "recording"}.`
      );
    } finally {
      setDownloadingKey(null);
    }
  };

  const submitRejection = (application: TeacherApplication) => {
    if (rejectReason.trim().length < 3) {
      setActionError("Give a short rejection reason (at least 3 characters).");
      return;
    }
    reviewMutation.mutate({
      id: application.id,
      status: "rejected",
      reason: rejectReason.trim(),
    });
  };

  if (!canManage) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Admin access is required for this page.
      </main>
    );
  }

  const applications = applicationsQuery.data ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Teacher applications</h1>
          <p className="text-lg text-foreground opacity-75">
            Review CVs and approve new teachers. Approving creates the teacher
            account and sends a set-password invite.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setFilter(option.value);
                setActionError("");
                setNotice("");
                setRejectingId(null);
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === option.value
                  ? "bg-green-600 text-white"
                  : "border border-card-border bg-card-bg hover:border-green-500"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {notice && (
          <p
            role="status"
            className="mb-6 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-sm"
          >
            {notice}
          </p>
        )}
        {(actionError || applicationsQuery.isError) && (
          <p
            role="alert"
            className="mb-6 rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400"
          >
            {actionError ||
              (applicationsQuery.error instanceof Error
                ? applicationsQuery.error.message
                : "Unable to load applications.")}
          </p>
        )}

        {applicationsQuery.isLoading ? (
          <p className="flex items-center gap-2 text-sm opacity-70">
            <Loader2 size={16} className="animate-spin" /> Loading applications…
          </p>
        ) : applications.length === 0 ? (
          <div className="rounded-3xl border border-card-border bg-card-bg p-10 text-center">
            <p className="text-lg font-semibold mb-1">
              No {filter === "all" ? "" : filter} applications
            </p>
            <p className="text-sm opacity-70">
              New teacher applications will appear here after they are submitted
              from the public form.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {applications.map((application) => {
              const isReviewing =
                reviewMutation.isPending &&
                reviewMutation.variables?.id === application.id;
              return (
                <article
                  key={application.id}
                  className="rounded-3xl border border-card-border bg-card-bg p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {application.fullName}
                      </h2>
                      <p className="text-sm opacity-70">
                        {application.email} · {application.phoneNumber}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        statusStyles[application.status]
                      }`}
                    >
                      {application.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {application.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-400"
                      >
                        {teacherSubjectLabel[subject] ?? subject}
                      </span>
                    ))}
                    <span className="rounded-full border border-card-border px-3 py-1 text-xs">
                      English:{" "}
                      {englishLevelLabel[application.englishLevel] ??
                        application.englishLevel}
                    </span>
                    <span className="rounded-full border border-card-border px-3 py-1 text-xs">
                      {application.experienceYears} year
                      {application.experienceYears === 1 ? "" : "s"} of
                      experience
                    </span>
                  </div>

                  <p className="mt-4 whitespace-pre-line text-sm leading-6 opacity-80">
                    {application.bio}
                  </p>
                  {application.availabilityNote && (
                    <p className="mt-2 text-sm opacity-70">
                      <strong>Availability:</strong>{" "}
                      {application.availabilityNote}
                    </p>
                  )}
                  <p className="mt-3 text-xs opacity-60">
                    Applied {formatDate(application.createdAt)}
                    {application.reviewedAt
                      ? ` · Reviewed ${formatDate(application.reviewedAt)}`
                      : ""}
                  </p>
                  {application.status === "rejected" &&
                    application.rejectionReason && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        Reason: {application.rejectionReason}
                      </p>
                    )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => downloadFile(application, "cv")}
                      disabled={
                        !application.cvFileName ||
                        downloadingKey === `${application.id}:cv`
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm font-semibold transition hover:border-green-500 disabled:opacity-60"
                    >
                      {downloadingKey === `${application.id}:cv` ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Download size={16} />
                      )}
                      {application.cvFileName ? "Download CV" : "No CV"}
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadFile(application, "intro")}
                      disabled={
                        !application.introFileName ||
                        downloadingKey === `${application.id}:intro`
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm font-semibold transition hover:border-green-500 disabled:opacity-60"
                    >
                      {downloadingKey === `${application.id}:intro` ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Mic size={16} />
                      )}
                      {application.introFileName
                        ? "Download intro"
                        : "No intro recording"}
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadFile(application, "quran")}
                      disabled={
                        !application.quranRecordingFileName ||
                        downloadingKey === `${application.id}:quran`
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm font-semibold transition hover:border-green-500 disabled:opacity-60"
                    >
                      {downloadingKey === `${application.id}:quran` ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <BookOpen size={16} />
                      )}
                      {application.quranRecordingFileName
                        ? "Download Quran recitation"
                        : "No Quran recording"}
                    </button>

                    {application.status === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            reviewMutation.mutate({
                              id: application.id,
                              status: "approved",
                            })
                          }
                          disabled={isReviewing}
                          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
                        >
                          {isReviewing ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setRejectingId((current) =>
                              current === application.id ? null : application.id
                            )
                          }
                          disabled={isReviewing}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-400/50 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </>
                    )}
                  </div>

                  {application.status === "approved" &&
                    application.teacherId && (
                      <p className="mt-3 inline-flex items-center gap-2 text-xs text-green-700 dark:text-green-400">
                        <CheckCircle2 size={14} /> Teacher account linked
                      </p>
                    )}

                  {rejectingId === application.id && (
                    <div className="mt-4 rounded-2xl border border-card-border p-4">
                      <label
                        htmlFor={`reason-${application.id}`}
                        className="mb-2 block text-sm font-semibold"
                      >
                        Rejection reason
                      </label>
                      <textarea
                        id={`reason-${application.id}`}
                        rows={3}
                        value={rejectReason}
                        onChange={(event) =>
                          setRejectReason(event.target.value)
                        }
                        maxLength={500}
                        className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:border-green-500"
                        placeholder="Explain briefly why this application was not accepted."
                      />
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReason("");
                          }}
                          className="rounded-xl border border-card-border px-4 py-2 text-sm font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => submitRejection(application)}
                          disabled={isReviewing}
                          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {isReviewing ? "Rejecting…" : "Confirm rejection"}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <p className="mt-8 flex items-center gap-2 text-xs opacity-60">
          <FileText size={14} /> CVs and recordings are stored separately and
          downloaded only on demand, so this page stays light.
        </p>
      </div>
    </div>
  );
}
