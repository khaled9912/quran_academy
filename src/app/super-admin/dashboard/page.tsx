"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getStudents } from "@/services/student.service";
import { getTeachers } from "@/services/teacher.service";
import { getTeacherStudentAssignments } from "@/services/assignment.service";
import { getLessons } from "@/services/lesson.service";
import { getAdminChangeRequests } from "@/services/scheduling.service";
import { formatWeeklySlot } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";

const dateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function SuperAdminDashboard() {
  const { role, user } = useAuth();
  const isSuperAdmin = role === "super_admin";

  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: () => getStudents(),
    enabled: isSuperAdmin,
  });
  const teachersQuery = useQuery({
    queryKey: ["teachers"],
    queryFn: () => getTeachers(),
    enabled: isSuperAdmin,
  });
  const assignmentsQuery = useQuery({
    queryKey: ["teacher-student-assignments"],
    queryFn: getTeacherStudentAssignments,
    enabled: isSuperAdmin,
  });
  const lessonsQuery = useQuery({
    queryKey: ["lessons"],
    queryFn: () => getLessons(),
    enabled: isSuperAdmin,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });
  const changesQuery = useQuery({
    queryKey: ["change-requests", "admin", "pending"],
    queryFn: () => getAdminChangeRequests("pending"),
    enabled: isSuperAdmin,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });

  if (!isSuperAdmin) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Super admin access is required for this dashboard.
      </main>
    );
  }

  const queries = [
    studentsQuery,
    teachersQuery,
    assignmentsQuery,
    lessonsQuery,
    changesQuery,
  ];
  const loading = queries.some((query) => query.isLoading);
  const failed = queries.some((query) => query.isError);
  const changes = changesQuery.data ?? [];

  const metrics = [
    { title: "Students", value: studentsQuery.data?.length },
    { title: "Teachers", value: teachersQuery.data?.length },
    { title: "Assignments", value: assignmentsQuery.data?.length },
    { title: "Lessons", value: lessonsQuery.data?.length },
    { title: "Time changes waiting", value: changes.length },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-green-600 mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-lg opacity-75">
            {user?.full_name ? `Welcome back, ${user.full_name}. ` : ""}
            Academy-wide activity across accounts and lessons.
          </p>
        </div>

        {failed && (
          <p
            role="status"
            className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm"
          >
            Some totals could not be loaded. Check the API connection and your
            permissions.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-10">
          {metrics.map((metric) => (
            <div
              key={metric.title}
              className="rounded-3xl border border-card-border bg-card-bg p-6"
            >
              <p className="text-sm text-foreground opacity-70 mb-2">
                {metric.title}
              </p>
              <p className="text-3xl font-semibold text-green-600">
                {loading ? "…" : (metric.value ?? "—")}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-3xl border border-card-border bg-card-bg p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-semibold">Time change requests</h2>
              <Link
                href="/admin/change-requests"
                className="text-sm font-semibold text-green-600 hover:underline"
              >
                Review →
              </Link>
            </div>
            {loading ? (
              <p className="text-foreground opacity-70">
                Loading change requests…
              </p>
            ) : changes.length ? (
              <div className="space-y-3">
                {changes.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-card-border p-4"
                  >
                    <p className="font-semibold">
                      {formatWeeklySlot(
                        request.currentDayOfWeek,
                        request.currentStartsAtTime,
                        request.currentEndsAtTime
                      )}{" "}
                      →{" "}
                      {formatWeeklySlot(
                        request.requestedDayOfWeek,
                        request.requestedStartsAtTime,
                        request.requestedEndsAtTime
                      )}
                    </p>
                    <p className="mt-1 text-sm text-foreground opacity-70">
                      {request.studentName} with {request.teacherName}
                    </p>
                    <p className="mt-1 text-xs text-foreground opacity-60">
                      Requested {dateTime(request.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-foreground opacity-70">
                No student is waiting for a time change.
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-card-border bg-card-bg p-6">
            <h2 className="text-xl font-semibold mb-4">Manage the academy</h2>
            <div className="space-y-3">
              <Link
                href="/admin/students"
                className="block rounded-2xl border border-card-border p-4 hover:border-green-500 transition"
              >
                <p className="font-semibold">Students</p>
                <p className="text-sm text-foreground opacity-70">
                  Create and review student accounts.
                </p>
              </Link>
              <Link
                href="/admin/teachers"
                className="block rounded-2xl border border-card-border p-4 hover:border-green-500 transition"
              >
                <p className="font-semibold">Teachers</p>
                <p className="text-sm text-foreground opacity-70">
                  Review teacher accounts and subjects.
                </p>
              </Link>
              <Link
                href="/admin/change-requests"
                className="block rounded-2xl border border-card-border p-4 hover:border-green-500 transition"
              >
                <p className="font-semibold">Time change requests</p>
                <p className="text-sm text-foreground opacity-70">
                  Confirm new weekly times with teachers.
                </p>
              </Link>
              <Link
                href="/admin/teacher-applications"
                className="block rounded-2xl border border-card-border p-4 hover:border-green-500 transition"
              >
                <p className="font-semibold">Teacher applications</p>
                <p className="text-sm text-foreground opacity-70">
                  Review CVs and approve new teachers.
                </p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
