"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  GraduationCap,
  History,
  RefreshCw,
  Repeat,
  Video,
} from "lucide-react";
import type { Lesson } from "@/types/lesson";
import {
  laterLessons,
  todayLessons,
  upcomingLessons,
} from "@/lib/lesson-window";
import { NextUpLessons } from "@/components/NextUpLessons";
import { isLessonLive } from "@/lib/lesson-feedback";
import { useNow } from "@/hooks/use-now";
import { LiveNowBadge } from "@/components/LiveNowBadge";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import { useStudentDashboard } from "@/features/students/hooks/useStudentDashboard";
import { PendingAssignment } from "@/components/student/PendingAssignment";
import { TimeZoneNote } from "@/components/student/TimeZoneNote";
import { startsInLabel } from "@/lib/utils";
import {
  getViewerTimeZone,
  toViewerWeeklySlotLabel,
} from "@/lib/weekly-time";

const dateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const timeOfDay = (value: string) =>
  new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const levelWord = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "Not given";

const statusStyles: Record<Lesson["status"], string> = {
  scheduled:
    "bg-green-100 dark:bg-green-500/15 text-green-800 dark:text-green-300",
  in_progress: "bg-sky-100 dark:bg-sky-500/15 text-sky-800 dark:text-sky-300",
  completed: "bg-gray-100 dark:bg-gray-500/15 text-gray-700 dark:text-gray-300",
  cancelled: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300",
};

const changeStatusLabels: Record<string, string> = {
  applied: "Applied",
  pending: "Awaiting academy",
  approved: "Approved",
  rejected: "Declined",
};

const changeStatusStyles: Record<string, string> = {
  applied:
    "bg-green-100 dark:bg-green-500/15 text-green-800 dark:text-green-300",
  pending:
    "bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300",
  approved:
    "bg-green-100 dark:bg-green-500/15 text-green-800 dark:text-green-300",
  rejected: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300",
};

/** The lesson the student came for: today's if there is one, otherwise the next. */
function LessonHero({ lesson, now }: { lesson: Lesson; now: number }) {
  const live = isLessonLive(lesson.startsAt, lesson.endsAt, lesson.status, now);
  const isToday = todayLessons([lesson], now).length > 0;
  const countdown =
    lesson.status === "scheduled" && !live
      ? startsInLabel(lesson.startsAt, now)
      : null;

  return (
    <section className="rise-in overflow-hidden rounded-3xl border border-green-500/40 bg-card-bg">
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 md:p-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground opacity-70">
            {isToday ? "Today's lesson" : "Your next lesson"}
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-3 text-2xl font-bold md:text-3xl">
            {dateTime(lesson.startsAt)}
            {live && <LiveNowBadge />}
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-foreground opacity-70">
            <Clock3 size={15} />
            Until {timeOfDay(lesson.endsAt)}
            {lesson.teacherName ? ` with ${lesson.teacherName}` : ""}
          </p>
          {countdown && (
            <p className="mt-3 text-sm font-semibold text-green-600 dark:text-green-400">
              {countdown}
            </p>
          )}
        </div>
        <Link
          href={`/lesson/${lesson.id}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-600"
        >
          <Video size={17} />
          {live ? "Join now" : "Attend lesson"}
        </Link>
      </div>
    </section>
  );
}

const StudentDashboard = () => {
  const { lessonsQuery, availabilityQuery, changesQuery, onboardingQuery } =
    useStudentDashboard();
  const { user } = useAuth();
  const router = useRouter();
  const viewerTimeZone = getViewerTimeZone();
  const now = useNow();

  const onboarding = onboardingQuery.data ?? null;
  const teacher = availabilityQuery.data?.teacher ?? null;
  // Unassigned accounts get the guided setup first; a student who already has a
  // teacher is never interrupted with the wizard.
  const needsOnboarding =
    Boolean(availabilityQuery.data) && !teacher && !onboarding?.completedAt;

  useEffect(() => {
    if (needsOnboarding) router.replace("/student/onboarding");
  }, [needsOnboarding, router]);

  const lessons = lessonsQuery.data ?? [];
  const today = todayLessons(lessons, now);
  const nextUp = laterLessons(lessons, now);
  const upcoming = upcomingLessons(lessons, now);
  const hero = today[0] ?? upcoming[0] ?? null;
  const past = [...lessons]
    .filter((lesson) => lesson.status !== "scheduled")
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
    .slice(0, 5);
  const series = availabilityQuery.data?.series ?? [];
  const changes = changesQuery.data ?? [];
  const queryError =
    lessonsQuery.error ?? availabilityQuery.error ?? changesQuery.error;

  const refreshAll = () => {
    void lessonsQuery.refetch();
    void availabilityQuery.refetch();
    void changesQuery.refetch();
  };

  if (onboardingQuery.isLoading || availabilityQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background pb-16 pt-24">
        <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-16">
          <div className="h-32 animate-pulse rounded-3xl bg-foreground/10" />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="h-64 animate-pulse rounded-3xl bg-foreground/10 lg:col-span-2" />
            <div className="h-64 animate-pulse rounded-3xl bg-foreground/10" />
          </div>
        </div>
      </div>
    );
  }

  const firstName = (user?.fullName ?? "").trim().split(/\s+/)[0];

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-16">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 text-4xl font-bold">
              {firstName
                ? `Assalamu alaikum, ${firstName}`
                : "Student Dashboard"}
            </h1>
            <p className="text-lg text-foreground opacity-75">
              {teacher
                ? "Your weekly lesson and what is coming next."
                : "You are all set — we are finding your teacher."}
            </p>
          </div>
          <button
            onClick={refreshAll}
            className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 text-sm font-semibold hover:border-green-500"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {queryError && (
          <p
            role="alert"
            className="mb-6 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
          >
            {queryError instanceof Error
              ? queryError.message
              : "Unable to load your lesson information."}
          </p>
        )}

        {!teacher ? (
          <PendingAssignment onboarding={onboarding} />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              {hero ? (
                <LessonHero lesson={hero} now={now} />
              ) : (
                <section className="rounded-3xl border border-dashed border-card-border bg-card-bg p-8 text-center">
                  <p className="text-lg font-semibold">
                    No lesson on your schedule yet
                  </p>
                  <p className="mt-2 text-foreground opacity-70">
                    Your teacher will confirm your first time shortly. It will
                    appear here the moment it is booked.
                  </p>
                </section>
              )}

              <section className="rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
                <div className="mb-5 flex items-center gap-3">
                  <Repeat className="text-green-600 dark:text-green-400" />
                  <h2 className="text-2xl font-semibold">My schedule</h2>
                </div>
                {series.length ? (
                  <TimeZoneNote
                    zone={viewerTimeZone}
                    sourceZone={series[0]?.timeZoneId}
                    className="mb-4"
                  />
                ) : null}
                {series.length ? (
                  <div className="space-y-3">
                    {series.map((item) => {
                      const change = changes.find(
                        (entry) => entry.seriesId === item.id
                      );
                      return (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-card-border p-4"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold">
                              {toViewerWeeklySlotLabel(item, viewerTimeZone)}
                            </p>
                            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-foreground opacity-70">
                              <span>With {item.teacherName}</span>
                              {change && (
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                    changeStatusStyles[change.status] ??
                                    "bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300"
                                  }`}
                                >
                                  {changeStatusLabels[change.status] ??
                                    change.status}
                                </span>
                              )}
                            </p>
                          </div>
                          <Link
                            href={`/student/change-time/${item.id}`}
                            className="rounded-xl border border-card-border px-4 py-2 text-sm font-semibold transition hover:border-green-500"
                          >
                            Change time
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-foreground opacity-70">
                    Your weekly time is being set. It will show here once your
                    teacher confirms it.
                  </p>
                )}
              </section>

              <section className="rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="text-green-600 dark:text-green-400" />
                    <h2 className="text-2xl font-semibold">Coming up</h2>
                  </div>
                  <Link
                    href="/schedule"
                    className="text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"
                  >
                    Full schedule →
                  </Link>
                </div>
                {lessonsQuery.isLoading ? (
                  <div className="space-y-4">
                    {[0, 1].map((row) => (
                      <div
                        key={row}
                        className="h-20 animate-pulse rounded-2xl bg-foreground/10"
                      />
                    ))}
                  </div>
                ) : nextUp.length ? (
                  <NextUpLessons lessons={nextUp} perspective="student" />
                ) : (
                  <p className="text-foreground opacity-70">
                    Nothing else scheduled this week.
                  </p>
                )}
              </section>

              {past.length > 0 && (
                <section className="rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
                  <div className="mb-5 flex items-center gap-3">
                    <History className="text-green-600 dark:text-green-400" />
                    <h2 className="text-2xl font-semibold">Past lessons</h2>
                  </div>
                  <div className="space-y-3">
                    {past.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-card-border p-4"
                      >
                        <div className="min-w-0">
                          <p className="font-medium">
                            {dateTime(lesson.startsAt)}
                          </p>
                          <p className="text-sm text-foreground opacity-70">
                            With {lesson.teacherName ?? "your teacher"}
                          </p>
                        </div>
                        <span className="flex flex-wrap justify-end gap-2">
                          {lesson.isTrial && (
                            <span className="rounded-full bg-sky-100 dark:bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-800 dark:text-sky-300">
                              Trial
                            </span>
                          )}
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[lesson.status]}`}
                          >
                            {lesson.status.replaceAll("_", " ")}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-card-border bg-card-bg p-6">
                <h3 className="mb-4 text-lg font-semibold">My teacher</h3>
                <div className="flex items-center gap-3">
                  <Avatar
                    name={teacher.fullName ?? "Your teacher"}
                    src={teacher.avatarUrl}
                    className="h-12 w-12 rounded-full text-base"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold">
                      {teacher.fullName ?? "Your teacher"}
                    </p>
                    <p className="mt-0.5 text-sm text-foreground opacity-70">
                      {series.length
                        ? `Weekly for ${series.length} lesson${
                            series.length === 1 ? "" : "s"
                          }`
                        : "Your time is being confirmed"}
                    </p>
                  </div>
                </div>
              </div>

              {onboarding && (
                <div className="rounded-3xl border border-card-border bg-card-bg p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <GraduationCap
                      size={20}
                      className="text-green-600 dark:text-green-400"
                    />
                    <h3 className="text-lg font-semibold">Your level</h3>
                  </div>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-foreground opacity-70">
                        Quran reading
                      </dt>
                      <dd className="font-semibold">
                        {levelWord(onboarding.quranLevel)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-foreground opacity-70">Tajweed</dt>
                      <dd className="font-semibold">
                        {levelWord(onboarding.tajweedLevel)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-foreground opacity-70">
                        Islamic studies
                      </dt>
                      <dd className="font-semibold">
                        {levelWord(onboarding.islamicStudiesLevel)}
                      </dd>
                    </div>
                  </dl>
                  <Link
                    href="/student/onboarding"
                    className="mt-4 block rounded-xl border border-card-border px-4 py-2 text-center text-sm font-semibold transition hover:border-green-500"
                  >
                    Update my level and times
                  </Link>
                </div>
              )}

              <div className="rounded-3xl border border-card-border bg-card-bg p-6">
                <h3 className="mb-2 text-lg font-semibold">Need help?</h3>
                <p className="mb-4 text-sm text-foreground opacity-70">
                  Message the academy if a weekly time needs to change.
                </p>
                <Link
                  href="/contact"
                  className="block rounded-xl border border-green-500 px-4 py-2 text-center font-semibold text-green-600 transition hover:bg-green-500 hover:text-white dark:text-green-400"
                >
                  Contact us
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
