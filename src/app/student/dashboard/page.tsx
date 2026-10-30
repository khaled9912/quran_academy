"use client";

import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  GraduationCap,
  Hourglass,
  RefreshCw,
  Video,
} from "lucide-react";
import type { Lesson } from "@/types/lesson";
import { useStudentDashboard } from "@/features/students/hooks/useStudentDashboard";
import { TeacherDirectory } from "@/components/student/TeacherDirectory";

const dateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const requestStatusLabels: Record<string, string> = {
  pending_teacher: "Awaiting teacher confirmation",
  pending_student: "Awaiting your confirmation",
  pending_admin: "Awaiting academy approval",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
  expired: "Expired",
};

const statusStyles: Record<Lesson["status"], string> = {
  scheduled: "bg-green-100 text-green-800",
  in_progress: "bg-sky-100 text-sky-800",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

const StudentDashboard = () => {
  const { lessonsQuery, availabilityQuery, requestsQuery } =
    useStudentDashboard();
  const lessons = lessonsQuery.data ?? [];
  const sorted = [...lessons].sort((a, b) =>
    a.startsAt.localeCompare(b.startsAt)
  );
  const now = Date.now();
  const upcoming = sorted.filter(
    (lesson) =>
      new Date(lesson.startsAt).getTime() >= now &&
      lesson.status !== "cancelled" &&
      lesson.status !== "completed"
  );
  const completed = sorted.filter((lesson) => lesson.status === "completed");
  const cancelled = sorted.filter((lesson) => lesson.status === "cancelled");
  const teacher = availabilityQuery.data?.teacher;
  const requests = requestsQuery.data ?? [];
  const openRequests = requests.filter((request) =>
    request.status.startsWith("pending_")
  );
  const queryError =
    lessonsQuery.error ?? availabilityQuery.error ?? requestsQuery.error;

  const refreshAll = () => {
    void lessonsQuery.refetch();
    void availabilityQuery.refetch();
    void requestsQuery.refetch();
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Student Dashboard</h1>
            <p className="text-lg text-foreground opacity-75">
              Your confirmed lessons and what is coming next.
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
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {queryError instanceof Error
              ? queryError.message
              : "Unable to load your lesson information."}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/student/availability"
                className="rounded-xl bg-green-500 px-4 py-3 text-center font-semibold text-white transition hover:bg-green-600"
              >
                Book a lesson
              </Link>
              <Link
                href="/schedule"
                className="rounded-xl border border-green-500 px-4 py-3 text-center font-semibold text-green-600 transition hover:bg-green-500 hover:text-white"
              >
                My schedule
              </Link>
            </div>

            <TeacherDirectory compact />

            <section className="bg-card-bg border border-card-border rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Hourglass className="text-green-600" />
                <h2 className="text-2xl font-semibold">Lesson requests</h2>
              </div>              {requestsQuery.isLoading ? (
                <p className="text-foreground opacity-70">
                  Loading your requests…
                </p>
              ) : requests.length ? (
                <div className="space-y-3">
                  {requests.slice(0, 5).map((request) => (
                    <div
                      key={request.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-card-border p-4"
                    >
                      <div>
                        <p className="font-medium">
                          {dateTime(request.startsAt)}
                        </p>
                        <p className="text-sm text-foreground opacity-70">
                          Teacher:{" "}
                          {request.teacherName ??
                            teacher?.fullName ??
                            "Assigned teacher"}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          request.status.startsWith("pending_")
                            ? "bg-amber-100 text-amber-800"
                            : request.status === "rejected" ||
                                request.status === "cancelled" ||
                                request.status === "expired"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {requestStatusLabels[request.status] ?? request.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-foreground opacity-70">
                  You have not requested a lesson yet.{" "}
                  <Link
                    href="/student/availability"
                    className="font-semibold text-green-600 hover:underline"
                  >
                    Choose an available time
                  </Link>
                  .
                </p>
              )}
            </section>

            <section className="bg-card-bg border border-card-border rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <CalendarDays className="text-green-600" />
                <h2 className="text-2xl font-semibold">Upcoming lessons</h2>
              </div>
              {lessonsQuery.isLoading ? (
                <p className="text-foreground opacity-70">
                  Loading your lessons…
                </p>
              ) : upcoming.length ? (
                <div className="space-y-4">
                  {upcoming.map((lesson) => (
                    <article
                      key={lesson.id}
                      className="rounded-2xl border border-card-border p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">
                            {dateTime(lesson.startsAt)}
                          </p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-foreground opacity-70">
                            <Clock3 size={15} />
                            Until{" "}
                            {new Date(lesson.endsAt).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="mt-1 text-sm text-foreground opacity-70">
                            Teacher: {lesson.teacherName ?? "Assigned teacher"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[lesson.status]}`}
                          >
                            {lesson.status.replaceAll("_", " ")}
                          </span>
                          <Link
                            href={`/lesson/${lesson.id}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
                          >
                            <Video size={15} /> Attend lesson
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-card-border p-8 text-center text-foreground opacity-70">
                  {openRequests.length ? (
                    <>
                      You have a lesson request awaiting approval. Your lesson
                      will appear here once your teacher and the academy confirm
                      it.
                    </>
                  ) : (
                    <>
                      No confirmed lessons yet.{" "}
                      <Link
                        href="/student/availability"
                        className="font-semibold text-green-600 hover:underline"
                      >
                        Choose an available time
                      </Link>{" "}
                      to request your first lesson.
                    </>
                  )}
                </div>
              )}
            </section>

            <section className="bg-card-bg border border-card-border rounded-3xl p-6 md:p-8">
              <h2 className="text-2xl font-semibold mb-4">Lesson history</h2>
              {completed.length + cancelled.length === 0 ? (
                <p className="text-foreground opacity-70">
                  Your past lessons will appear here.
                </p>
              ) : (
                <div className="space-y-3">
                  {[...completed, ...cancelled]
                    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
                    .slice(0, 10)
                    .map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-card-border p-4"
                      >
                        <div>
                          <p className="font-medium">
                            {dateTime(lesson.startsAt)}
                          </p>
                          <p className="text-sm text-foreground opacity-70">
                            Teacher: {lesson.teacherName ?? "Assigned teacher"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[lesson.status]}`}
                        >
                          {lesson.status.replaceAll("_", " ")}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <div className="bg-card-bg border border-card-border rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="text-green-600" size={20} />
                <h3 className="text-lg font-semibold">Your teacher</h3>
              </div>
              {availabilityQuery.isLoading ? (
                <p className="text-sm text-foreground opacity-70">Loading…</p>
              ) : teacher ? (
                <>
                  <p className="text-lg font-semibold">{teacher.fullName}</p>
                  {teacher.email && (
                    <p className="mt-1 text-sm text-foreground opacity-70">
                      {teacher.email}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-foreground opacity-70">
                  No teacher is assigned to you yet. Please contact the academy.
                </p>
              )}
              <Link
                href="/student/availability"
                className="mt-4 block rounded-xl bg-green-500 px-4 py-2 text-center font-semibold text-white transition hover:bg-green-600"
              >
                Book a lesson
              </Link>
            </div>

            <div className="bg-card-bg border border-card-border rounded-3xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick stats</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-foreground opacity-70">
                    Upcoming lessons
                  </dt>
                  <dd className="text-3xl font-bold text-green-600">
                    {upcoming.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-foreground opacity-70">
                    Completed
                  </dt>
                  <dd className="text-3xl font-bold text-green-600">
                    {completed.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-foreground opacity-70">
                    Cancelled
                  </dt>
                  <dd className="text-3xl font-bold text-green-600">
                    {cancelled.length}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-card-bg border border-card-border rounded-3xl p-6">
              <h3 className="text-lg font-semibold mb-2">Need help?</h3>
              <p className="text-sm text-foreground opacity-70 mb-4">
                Contact the academy team if a lesson needs to be rescheduled.
              </p>
              <Link
                href="/contact"
                className="block rounded-xl border border-green-500 px-4 py-2 text-center font-semibold text-green-600 transition hover:bg-green-500 hover:text-white"
              >
                Contact us
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
