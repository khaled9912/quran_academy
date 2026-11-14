"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserMinus } from "lucide-react";
import {
  getTeacherStudentAssignments,
  removeTeacherStudentAssignment,
} from "@/services/assignment.service";
import { ApiError } from "@/lib/backend-client";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { AssignmentStudio } from "@/components/admin/AssignmentStudio";

const queryError = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function AdminAssignmentsPage() {
  const { role } = useAuth();
  const { showToast } = useToast();
  const canManage = role === "admin" || role === "super_admin";
  const queryClient = useQueryClient();

  const assignmentsQuery = useQuery({
    queryKey: ["teacher-student-assignments"],
    queryFn: getTeacherStudentAssignments,
    enabled: canManage,
  });

  const assignments = assignmentsQuery.data ?? [];
  const activeAssignments = assignments.filter(
    (assignment) => assignment.status === "active"
  );

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeTeacherStudentAssignment(id),
    onSuccess: async () => {
      showToast("Assignment removed.", "success");
      await queryClient.invalidateQueries({
        queryKey: ["teacher-student-assignments"],
      });
    },
    onError: (mutationError) => {
      if (!(mutationError instanceof ApiError)) {
        showToast(
          queryError(mutationError, "Unable to remove the assignment."),
          "error"
        );
      }
    },
  });

  if (!canManage) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Admin access is required to manage assignments.
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <Link
            href="/admin/dashboard"
            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-400 mb-3 inline-block"
          >
            ← Back to admin dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">Teacher assignments</h1>
          <p className="text-lg text-foreground opacity-75">
            Students never choose a teacher — the academy does. Place each new
            signup with a teacher and book their weekly lesson.
          </p>
        </div>

        <AssignmentStudio />

        <section>
          <h2 className="text-2xl font-semibold mb-4">Active assignments</h2>
          {assignmentsQuery.isLoading ? (
            <p className="text-foreground opacity-70">Loading assignments…</p>
          ) : assignmentsQuery.error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
            >
              {queryError(
                assignmentsQuery.error,
                "Unable to load assignments."
              )}
            </p>
          ) : activeAssignments.length ? (
            <div className="space-y-3">
              {activeAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-card-border bg-card-bg p-5"
                >
                  <div>
                    <p className="font-semibold">
                      {assignment.studentName ?? "Student"}
                    </p>
                    <p className="text-sm text-foreground opacity-70">
                      with {assignment.teacherName ?? "Teacher"}
                    </p>
                  </div>
                  <button
                    onClick={() => removeMutation.mutate(assignment.id)}
                    disabled={removeMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-300 dark:border-red-500/30 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                  >
                    <UserMinus size={15} /> Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-10 text-center text-foreground opacity-70">
              No active assignments yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
