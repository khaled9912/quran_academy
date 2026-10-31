"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getStudents } from "@/services/student.service";
import { getTeachers } from "@/services/teacher.service";
import { getTeacherStudentAssignments } from "@/services/assignment.service";
import { getLessons } from "@/services/lesson.service";
import { useAuth } from "@/providers/auth-provider";

export default function AdminDashboardPage() {
  const { role } = useAuth();
  const canManage = role === "admin" || role === "super_admin";

  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: () => getStudents(),
    enabled: canManage,
  });
  const teachersQuery = useQuery({
    queryKey: ["teachers"],
    queryFn: () => getTeachers(),
    enabled: canManage,
  });
  const assignmentsQuery = useQuery({
    queryKey: ["teacher-student-assignments"],
    queryFn: getTeacherStudentAssignments,
    enabled: canManage,
  });
  const lessonsQuery = useQuery({
    queryKey: ["lessons"],
    queryFn: () => getLessons(),
    enabled: canManage,
  });

  const queries = [
    studentsQuery,
    teachersQuery,
    assignmentsQuery,
    lessonsQuery,
  ];
  const loading = queries.some((query) => query.isLoading);
  const failed = queries.some((query) => query.isError);

  const metrics = [
    { title: "Students", value: studentsQuery.data?.length },
    { title: "Teachers", value: teachersQuery.data?.length },
    {
      title: "Teacher / student assignments",
      value: assignmentsQuery.data?.length,
    },
    { title: "Individual lessons", value: lessonsQuery.data?.length },
  ];

  if (!canManage) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Admin access is required for this dashboard.
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-lg text-foreground opacity-75">
            Manage teachers, students, assignments, and individual lessons.
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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/students"
            className="rounded-3xl border border-card-border bg-card-bg p-6 hover:border-green-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Manage Students</h2>
            <p className="text-foreground opacity-75">
              Create, edit, deactivate, or remove student accounts.
            </p>
          </Link>
          <Link
            href="/admin/teachers"
            className="rounded-3xl border border-card-border bg-card-bg p-6 hover:border-green-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Manage Teachers</h2>
            <p className="text-foreground opacity-75">
              Create, edit, deactivate accounts and manage their availability
              slots.
            </p>
          </Link>
          <Link
            href="/admin/assignments"
            className="rounded-3xl border border-card-border bg-card-bg p-6 hover:border-green-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Assignments</h2>
            <p className="text-foreground opacity-75">
              Assign any student to any teacher and remove assignments.
            </p>
          </Link>
          <Link
            href="/admin/lesson-approvals"
            className="rounded-3xl border border-card-border bg-card-bg p-6 hover:border-green-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Lesson approvals</h2>
            <p className="text-foreground opacity-75">
              Give final approval to lesson requests confirmed by teachers.
            </p>
          </Link>
          <Link
            href="/admin/teacher-applications"
            className="rounded-3xl border border-card-border bg-card-bg p-6 hover:border-green-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Teacher applications</h2>
            <p className="text-foreground opacity-75">
              Review CVs from Quran, Tajweed, Islamic studies, and Arabic
              teachers, then approve or reject them.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
