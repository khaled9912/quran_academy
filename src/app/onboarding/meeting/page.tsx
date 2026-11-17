"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { JitsiRoom } from "@/components/JitsiRoom";
import { useAuth } from "@/providers/auth-provider";
import { getOnboardingMeeting } from "@/services/teacher-onboarding.service";
import type { LessonRoomFlags } from "@/services/lesson-room-config.service";

const JITSI_DOMAIN = (process.env.NEXT_PUBLIC_JITSI_DOMAIN ?? "meet.jit.si")
  .replace(/^https?:\/\//, "")
  .replace(/\/+$/, "");

// A plain meeting room: none of the lesson machinery (reports, transcription,
// branded backdrop) applies to an intro conversation.
const MEETING_FLAGS: LessonRoomFlags = {
  whiteboard: false,
  chat: true,
  cameraBackground: false,
  pen: false,
  performanceSettings: false,
  transcription: false,
  reportConcern: false,
};

const formatWhen = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

function MeetingRoom() {
  const { role, profile } = useAuth();
  const router = useRouter();
  const applicationId = useSearchParams().get("applicationId") ?? undefined;
  const isStaff = role === "admin" || role === "super_admin";
  const canJoin = isStaff || role === "teacher";

  const query = useQuery({
    queryKey: ["onboarding-meeting", applicationId ?? "mine"],
    queryFn: () => getOnboardingMeeting(isStaff ? applicationId : undefined),
    enabled: canJoin && (!isStaff || !!applicationId),
    retry: false,
  });

  const backHref = isStaff
    ? "/admin/teacher-applications"
    : "/teacher/dashboard";

  if (!canJoin)
    return (
      <main className="mx-auto max-w-xl px-5 py-24 text-foreground">
        This room is for the teacher and the academy team.
      </main>
    );

  if (query.isLoading)
    return (
      <main className="mx-auto flex max-w-xl items-center gap-3 px-5 py-24 text-foreground">
        <Loader2 className="animate-spin" /> Loading the meeting…
      </main>
    );

  const meeting = query.data;
  if (!meeting)
    return (
      <main className="mx-auto max-w-xl px-5 py-24 text-foreground">
        <div className="rounded-3xl border border-card-border bg-card-bg p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">No meeting scheduled</h1>
          <p className="mt-3 text-foreground/70">
            {isStaff
              ? "Propose meeting times on the application first."
              : "Intro meetings are joined from the link the academy emails you."}
          </p>
          <Link
            href={backHref}
            className="mt-6 inline-block rounded-xl border border-card-border px-4 py-2.5 text-sm font-semibold transition hover:border-green-500"
          >
            Back
          </Link>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen bg-background pt-20 text-foreground">
      <div className="mx-auto max-w-6xl px-4 pb-4 md:px-8">
        <h1 className="text-xl font-bold">
          Intro meeting with {meeting.counterpartName}
        </h1>
        <p className="text-sm text-foreground/70">
          {formatWhen(meeting.startsAt)} — 30 minutes
        </p>
      </div>
      <div className="mx-auto h-[70vh] max-w-6xl px-4 md:px-8">
        <JitsiRoom
          domain={JITSI_DOMAIN}
          room={meeting.room}
          displayName={profile?.fullName ?? "Guest"}
          flags={MEETING_FLAGS}
          onClose={() => router.replace(backHref)}
        />
      </div>
    </main>
  );
}

export default function OnboardingMeetingPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex max-w-xl items-center gap-3 px-5 py-24 text-foreground">
          <Loader2 className="animate-spin" /> Loading the meeting…
        </main>
      }
    >
      <MeetingRoom />
    </Suspense>
  );
}