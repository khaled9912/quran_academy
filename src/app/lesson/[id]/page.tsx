"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, MonitorPlay, RefreshCw, ShieldCheck } from "lucide-react";
import { ApiError } from "@/lib/backend-client";
import { getLessonById } from "@/services/lesson.service";
import { useAuth } from "@/providers/auth-provider";

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
  const { profile, role, isLoading: authLoading } = useAuth();

  const lessonQuery = useQuery({
    queryKey: ["lessons", id],
    queryFn: () => getLessonById(id),
    enabled: !!id && !!profile,
  });

  const lesson = lessonQuery.data;
  const displayName = profile?.fullName ?? profile?.full_name ?? profile?.email ?? "Guest";
  const backHref = role === "teacher" ? "/teacher/schedule" : role === "student" ? "/schedule" : "/admin/dashboard";
  const backLabel = role === "admin" || role === "super_admin" ? "Back to dashboard" : "Back to schedule";

  const room = `rayan-academy-${id}`;
  const jitsiUrl = `https://${JITSI_DOMAIN}/${room}#${new URLSearchParams({
    "userInfo.displayName": displayName,
    "config.prejoinPageEnabled": "false",
    "config.prejoinConfig.enabled": "false",
    "config.enableWelcomePage": "false",
    "config.disableDeepLinking": "true",
  }).toString()}`;

  if (authLoading || !profile) return null;

  const error = lessonQuery.error;
  const forbidden = error instanceof ApiError && (error.status === 403 || error.status === 404);

  return (
    <main className="min-h-screen bg-background text-foreground pt-24 pb-10">
      <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-16">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href={backHref} className="mb-3 inline-block text-green-600 hover:text-green-700">
              ← {backLabel}
            </Link>
            <h1 className="text-4xl font-bold mb-2">Lesson room</h1>
            {lesson ? (
              <p className="text-lg text-foreground opacity-75">
                {dateTime(lesson.startsAt)} · {lesson.teacherName ?? "Teacher"} with {lesson.studentName ?? "Student"}
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
          <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error instanceof Error ? error.message : "Unable to load this lesson."}
          </p>
        ) : lesson && (lesson.status === "cancelled" || lesson.status === "completed") ? (
          <div className="rounded-2xl border border-dashed border-card-border bg-card-bg p-10 text-center text-foreground opacity-70">
            This lesson is {lesson.status}. The room is closed.
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-3xl border border-card-border bg-black">
              <iframe
                src={jitsiUrl}
                title="Lesson video call"
                className="h-[70vh] min-h-[420px] w-full"
                allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
                allowFullScreen
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-foreground opacity-70">
              <p className="inline-flex items-center gap-2">
                <MonitorPlay size={16} className="text-green-600" />
                Use the screen-share button in the call toolbar to present your screen.
              </p>
              <a
                href={jitsiUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-semibold text-green-600 hover:underline"
              >
                <ExternalLink size={15} /> Open in a new tab
              </a>
            </div>
            <p className="mt-3 inline-flex items-center gap-2 text-xs text-foreground opacity-60">
              <ShieldCheck size={14} />
              Rooms are unlisted but not password-protected. Do not share this page URL.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
