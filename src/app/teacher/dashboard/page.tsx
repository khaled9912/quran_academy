"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getLessons } from "@/services/lesson.service";
import {
  getIncomingLessonRequests,
  getMyAvailability,
} from "@/services/scheduling.service";
import { useAuth } from "@/providers/auth-provider";
import { isReportDue } from "@/lib/lesson-feedback";

const dateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function TeacherDashboardPage() {
  const { role } = useAuth();
  const isTeacher = role === "teacher";

  const lessonsQuery = useQuery({
    queryKey: ["lessons"],
    queryFn: () => getLessons(),
    enabled: isTeacher,
  });
  const requestsQuery = useQuery({
    queryKey: ["lesson-requests", "teacher"],
    queryFn: getIncomingLessonRequests,
    enabled: isTeacher,
  });
  const availabilityQuery = useQuery({
    queryKey: ["availability", "teacher"],
    queryFn: getMyAvailability,
    enabled: isTeacher,
  });

  const lessons = lessonsQuery.data ?? [];
  const requests = requestsQuery.data ?? [];
  const slots = availabilityQuery.data ?? [];
  const failed =
    lessonsQuery.isError || requestsQuery.isError || availabilityQuery.isError;
  const now = Date.now();

  const upcomingLessons = lessons
    .filter(
      (lesson) =>
        lesson.status !== "cancelled" &&
        lesson.status !== "completed" &&
        new Date(lesson.startsAt).getTime() >= now
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const pendingRequests = requests.filter(
    (request) => request.status === "pending_teacher"
  );
  const openSlots = slots.filter(
    (slot) =>
      slot.status === "available" && new Date(slot.startsAt).getTime() >= now
  );
  const reportsDue = lessons
    .filter(isReportDue)
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));

  const metrics: { title: string; value: number; href?: string }[] = [
    { title: "Upcoming lessons", value: upcomingLessons.length },
    { title: "Requests awaiting you", value: pendingRequests.length },
    {
      title: "Reports due",
      value: reportsDue.length,
      href: "/teacher/schedule?filter=reports",
    },
    { title: "Available slots", value: openSlots.length },
  ];

  if (!isTeacher) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Teacher access is required for this dashboard.
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Teacher Dashboard</h1>
          <p className="text-lg text-foreground opacity-75">
            Your confirmed lessons, student requests, and published
            availability.
          </p>
        </div>

        {failed && (
          <p
            role="status"
            className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm"
          >
            Some of your data could not be loaded. Check the API connection and
            try refreshing.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {metrics.map((metric) => {
            const card = (
              <>
                <p className="text-sm uppercase text-foreground opacity-70 mb-2">
                  {metric.title}
                </p>
                <p className="text-3xl font-semibold text-green-600">
                  {metric.value}
                </p>
              </>
            );
            const className =
              "rounded-3xl border border-card-border bg-card-bg p-6";
            return metric.href ? (
              <Link
                key={metric.title}
                href={metric.href}
                className={`${className} transition hover:border-amber-400`}
              >
                {card}
              </Link>
            ) : (
              <div key={metric.title} className={className}>
                {card}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-3xl border border-card-border bg-card-bg p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-semibold">Next lessons</h2>
              <Link
                href="/teacher/schedule"
                className="text-sm font-semibold text-green-600 hover:underline"
              >
                Full schedule →
              </Link>
            </div>
            {lessonsQuery.isLoading ? (
              <p className="text-foreground opacity-70">Loading lessons…</p>
            ) : upcomingLessons.length ? (
              <div className="space-y-3">
                {upcomingLessons.slice(0, 4).map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-card-border p-4"
                  >
                    <div>
                      <p className="font-semibold">
                        {dateTime(lesson.startsAt)}
                      </p>
                      <p className="mt-1 text-sm text-foreground opacity-70">
                        Student: {lesson.studentName ?? "Assigned student"}
                      </p>
                    </div>
                    <Link
                      href={`/lesson/${lesson.id}`}
                      className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
                    >
                      Join lesson
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-foreground opacity-70">
                No confirmed lessons yet.
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-card-border bg-card-bg p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-semibold">Lesson requests</h2>
              <Link
                href="/teacher/lesson-requests"
                className="text-sm font-semibold text-green-600 hover:underline"
              >
                Review all →
              </Link>
            </div>
            {requestsQuery.isLoading ? (
              <p className="text-foreground opacity-70">Loading requests…</p>
            ) : pendingRequests.length ? (
              <div className="space-y-3">
                {pendingRequests.slice(0, 4).map((request) => (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-card-border p-4"
                  >
                    <p className="font-semibold">
                      {dateTime(request.startsAt)}
                    </p>
                    <p className="mt-1 text-sm text-foreground opacity-70">
                      Student: {request.studentName ?? "Student"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-foreground opacity-70">
                No requests are waiting for your response.
              </p>
            )}
          </section>
        </div>

        {reportsDue.length > 0 && (
          <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50/70 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-semibold">Class reports due</h2>
                <p className="mt-1 text-sm text-foreground opacity-70">
                  Every finished lesson needs a class summary and student
                  feedback.
                </p>
              </div>
              <Link
                href="/teacher/schedule?filter=reports"
                className="text-sm font-semibold text-green-700 hover:underline"
              >
                Open schedule →
              </Link>
            </div>
            <div className="space-y-3">
              {reportsDue.slice(0, 5).map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-white/70 p-4"
                >
                  <div>
                    <p className="font-semibold">{dateTime(lesson.startsAt)}</p>
                    <p className="mt-1 text-sm text-foreground opacity-70">
                      Student: {lesson.studentName ?? "Assigned student"}
                    </p>
                  </div>
                  <Link
                    href={`/lesson/${lesson.id}`}
                    className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
                  >
                    Write report
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Link
            href="/teacher/availability"
            className="rounded-3xl border border-card-border bg-card-bg p-6 hover:border-green-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Manage availability</h2>
            <p className="text-foreground opacity-75">
              Publish the lesson times your assigned students can request.
            </p>
          </Link>
          <Link
            href="/teacher/schedule"
            className="rounded-3xl border border-card-border bg-card-bg p-6 hover:border-green-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Teaching schedule</h2>
            <p className="text-foreground opacity-75">
              Review confirmed lessons and cancel a lesson if needed.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
