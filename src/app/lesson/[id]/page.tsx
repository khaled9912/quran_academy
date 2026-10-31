"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MonitorPlay, RefreshCw, ShieldCheck } from "lucide-react";
import { ApiError } from "@/lib/backend-client";
import { getLessonById } from "@/services/lesson.service";
import { useAuth } from "@/providers/auth-provider";
import { JitsiRoom } from "@/components/JitsiRoom";
import { LessonFeedback } from "@/components/lesson/LessonFeedback";
import { isLessonEnded } from "@/lib/lesson-feedback";

const JITSI_DOMAIN = (process.env.NEXT_PUBLIC_JITSI_DOMAIN ?? "meet.jit.si")
  .replace(/^https?:\/\//, "")
  .replace(/\/+$/, "");

const dateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function LessonCallPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();
  const { profile, role, isLoading: authLoading } = useAuth();

  const lessonQuery = useQuery({
    queryKey: ["lessons", id],
    queryFn: () => getLessonById(id),
    enabled: !!id && !!profile,
  });

  const lesson = lessonQuery.data;
  const displayName =
    profile?.fullName ?? profile?.full_name ?? profile?.email ?? "Guest";
  const backHref =
    role === "teacher"
      ? "/teacher/schedule"
      : role === "student"
        ? "/schedule"
        : "/admin/dashboard";
  const backLabel =
    role === "admin" || role === "super_admin"
      ? "Back to dashboard"
      : "Back to schedule";

  const room = `rayan-academy-${id}`;
  const ended = lesson ? isLessonEnded(lesson.endsAt, lesson.status) : false;

  if (authLoading || !profile) return null;

  const error = lessonQuery.error;
  const forbidden =
    error instanceof ApiError && (error.status === 403 || error.status === 404);

  return (
    <main className="min-h-screen bg-background text-foreground pt-24 pb-10">
      <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-16">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href={backHref}
              className="mb-3 inline-block text-green-600 hover:text-green-700"
            >
              ← {backLabel}
            </Link>
            <h1 className="text-4xl font-bold mb-2">
              {ended ? "Lesson recap" : "Lesson room"}
            </h1>
            {lesson ? (
              <p className="text-lg text-foreground opacity-75">
                {dateTime(lesson.startsAt)} · {lesson.teacherName ?? "Teacher"}{" "}
                with {lesson.studentName ?? "Student"}
              </p>
            ) : (
              <p className="text-lg text-foreground opacity-75">
                Joining your private lesson room.
              </p>
            )}
          </div>
          <button
            onClick={() => void lessonQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold hover:border-green-500"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {forbidden ? (
          <div className="rounded-2xl border border-dashed border-card-border bg-card-bg p-10 text-center text-foreground opacity-70">
            This lesson does not exist or does not belong to your account.
          </div>
        ) : error ? (
          <p
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error instanceof Error
              ? error.message
              : "Unable to load this lesson."}
          </p>
        ) : lesson && lesson.status === "cancelled" ? (
          <div className="rounded-2xl border border-dashed border-card-border bg-card-bg p-10 text-center text-foreground opacity-70">
            This lesson was cancelled. The room is closed.
          </div>
        ) : lesson && ended ? (
          <LessonFeedback lesson={lesson} role={role} />
        ) : (
          <>
            <JitsiRoom
              domain={JITSI_DOMAIN}
              room={room}
              displayName={displayName}
              onClose={() => router.push(backHref)}
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-foreground opacity-70">
              <p className="inline-flex items-center gap-2">
                <MonitorPlay size={16} className="text-green-600" />
                Use the microphone, camera, and screen-share buttons in the call
                toolbar. If your browser blocks them, allow camera and
                microphone for this site and refresh.
              </p>
            </div>
            <p className="mt-3 inline-flex items-center gap-2 text-xs text-foreground opacity-60">
              <ShieldCheck size={14} />
              Rooms are unlisted but not password-protected. Do not share this
              page URL.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
