"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  MonitorPlay,
  RefreshCw,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { ApiError } from "@/lib/backend-client";
import { getLessonById } from "@/services/lesson.service";
import { useAuth } from "@/providers/auth-provider";
import { useLessonCall } from "@/providers/lesson-call-provider";
import { LessonFeedback } from "@/components/lesson/LessonFeedback";
import { LessonOperationsPanel } from "@/components/lesson/LessonOperationsPanel";
import { ShareLessonDrawer } from "@/components/lesson/ShareLessonDrawer";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";

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
    hour12: true,
  });

export default function LessonCallPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { profile, role, isLoading: authLoading } = useAuth();

  const lessonQuery = useQuery({
    queryKey: ["lessons", id],
    queryFn: () => getLessonById(id),
    enabled: !!id && !!profile,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });

  const lesson = lessonQuery.data;
  const isSupport = role === "admin" || role === "super_admin";
  // The room shows this to the other participant, so it is never an email address.
  const displayName =
    profile?.fullName?.trim() || profile?.full_name?.trim() || "Guest";
  const roomDisplayName = isSupport
    ? `${displayName} (Academy support)`
    : displayName;
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

  // Must match the mobile app's room name (ana-quran-<id>) so both clients
  // join the same conference.
  const room = `ana-quran-${id}`;

  // Waking up at the scheduled start and end keeps the room controls accurate
  // without a manual refresh.
  const startsAtMs = lesson ? new Date(lesson.startsAt).getTime() : null;
  const endsAtMs = lesson ? new Date(lesson.endsAt).getTime() : null;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (startsAtMs === null) return;
    const remaining = startsAtMs - Date.now();
    if (remaining <= 0) return;
    const timer = setTimeout(() => setNow(Date.now()), remaining + 500);
    return () => clearTimeout(timer);
  }, [startsAtMs]);
  useEffect(() => {
    if (endsAtMs === null) return;
    const remaining = endsAtMs - Date.now();
    if (remaining <= 0) return;
    const timer = setTimeout(() => setNow(Date.now()), remaining + 500);
    return () => clearTimeout(timer);
  }, [endsAtMs]);
  const beforeStart = startsAtMs !== null && now < startsAtMs;
  const afterEnd = endsAtMs !== null && now >= endsAtMs;

  // Refreshes keep arriving after the lesson ends. Once a participant has been
  // in a live room, that must not rip the call away from them mid-session.
  const [enteredWhileLive, setEnteredWhileLive] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  useEffect(() => {
    if (!lesson || lesson.status === "cancelled" || beforeStart || afterEnd) {
      return;
    }
    setEnteredWhileLive(true);
  }, [lesson, beforeStart, afterEnd]);

  // The clock alone decides when the room is open. A lesson that was started
  // or marked ended early stays joinable until its scheduled end, so either
  // side can rejoin after a dropped call.
  const showingRoom =
    !!lesson &&
    lesson.status !== "cancelled" &&
    !beforeStart &&
    (!afterEnd || enteredWhileLive);

  const { startCall, setMinimized } = useLessonCall();

  // The call itself lives in the root-layout provider, so this only registers
  // which room should be live. Navigating away no longer ends the conference.
  useEffect(() => {
    if (!showingRoom || !lesson) return;
    startCall({
      lessonId: id,
      room,
      domain: JITSI_DOMAIN,
      displayName: roomDisplayName,
      backHref,
      trackAttendance: role === "teacher" || role === "student",
    });
  }, [
    showingRoom,
    lesson,
    id,
    room,
    roomDisplayName,
    backHref,
    role,
    startCall,
  ]);

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
              className="mb-3 inline-block text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-400"
            >
              ← {backLabel}
            </Link>
            <h1 className="text-4xl font-bold mb-2">
              {afterEnd && !showingRoom ? "Lesson recap" : "Lesson room"}
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              disabled={!lesson || lesson.status === "cancelled"}
              className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold transition hover:border-green-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Share2 size={16} /> Share
            </button>
            <button
              onClick={() => void lessonQuery.refetch()}
              className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold hover:border-green-500"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {isSupport ? (
          <p className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
            Academy support view: opening this room adds you to the call as a
            third participant. Both sides will see “{displayName} (Academy
            support)” instead of your plain name.
          </p>
        ) : null}

        {lessonQuery.isLoading ? (
          <div className="rounded-2xl border border-dashed border-card-border bg-card-bg p-10 text-center text-foreground opacity-70">
            Preparing your lesson room…
          </div>
        ) : forbidden ? (
          <div className="rounded-2xl border border-dashed border-card-border bg-card-bg p-10 text-center text-foreground opacity-70">
            This lesson does not exist or does not belong to your account.
          </div>
        ) : error ? (
          <p
            role="alert"
            className="mb-6 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
          >
            {error instanceof Error
              ? error.message
              : "Unable to load this lesson."}
          </p>
        ) : lesson && lesson.status === "cancelled" ? (
          <div className="rounded-2xl border border-dashed border-card-border bg-card-bg p-10 text-center text-foreground opacity-70">
            This lesson was cancelled. The room is closed.
          </div>
        ) : lesson && beforeStart ? (
          <section className="rounded-3xl border border-dashed border-card-border bg-card-bg p-10 text-center">
            <Clock
              size={28}
              className="mx-auto text-green-600 dark:text-green-400"
            />
            <h2 className="mt-4 text-xl font-semibold">
              The room is not open yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-foreground opacity-70">
              This lesson room opens at {dateTime(lesson.startsAt)}. This page
              updates automatically.
            </p>
          </section>
        ) : lesson && afterEnd && !showingRoom ? (
          <LessonFeedback lesson={lesson} role={role} />
        ) : (
          <>
            <section className="rounded-3xl border border-card-border bg-card-bg p-8 text-center">
              <h2 className="text-xl font-semibold">
                Your lesson room is open
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-foreground opacity-70">
                The video call stays connected while you browse the site. Use
                the pop-out button in the call header to keep the video visible
                on other tabs and windows.
              </p>
              <button
                type="button"
                onClick={() => {
                  // Re-registering is a no-op for an active room, and recovers
                  // the page if the call state was lost (e.g. a dev refresh).
                  startCall({
                    lessonId: id,
                    room,
                    domain: JITSI_DOMAIN,
                    displayName,
                    backHref,
                    trackAttendance: role === "teacher" || role === "student",
                  });
                  setMinimized(false);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
              >
                <MonitorPlay size={16} /> Show lesson room
              </button>
            </section>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-foreground opacity-70">
              <p className="inline-flex items-center gap-2">
                <MonitorPlay
                  size={16}
                  className="text-green-600 dark:text-green-400"
                />
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

        {lesson && !forbidden && !error && lessonQuery.isSuccess && (
          <div className="mt-8">
            <LessonOperationsPanel lesson={lesson} role={role} />
          </div>
        )}
      </div>
      <ShareLessonDrawer
        open={shareOpen}
        shareUrl={`https://${JITSI_DOMAIN}/${room}`}
        onClose={() => setShareOpen(false)}
      />
    </main>
  );
}
