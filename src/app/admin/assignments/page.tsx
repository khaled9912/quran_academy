"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserCheck, UserMinus } from "lucide-react";
import { getTeachers } from "@/services/teacher.service";
import { getStudents } from "@/services/student.service";
import {
  assignStudentToTeacher,
  getTeacherStudentAssignments,
  removeTeacherStudentAssignment,
} from "@/services/assignment.service";
import { ApiError } from "@/lib/backend-client";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { SelectField } from "@/components/ui/select-field";

const queryError = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function AdminAssignmentsPage() {
  const { role } = useAuth();
  const { showToast } = useToast();
  const canManage = role === "admin" || role === "super_admin";
  const queryClient = useQueryClient();

  const teachersQuery = useQuery({
    queryKey: ["teachers"],
    queryFn: () => getTeachers(),
    enabled: canManage,
  });
  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: () => getStudents(),
    enabled: canManage,
  });
  const assignmentsQuery = useQuery({
    queryKey: ["teacher-student-assignments"],
    queryFn: getTeacherStudentAssignments,
    enabled: canManage,
  });

  const [teacherId, setTeacherId] = useState("");
  const [studentId, setStudentId] = useState("");

  const teachers = teachersQuery.data ?? [];
  const students = studentsQuery.data ?? [];
  const assignments = assignmentsQuery.data ?? [];
  const activeAssignments = assignments.filter(
    (assignment) => assignment.status === "active"
  );

  const currentTeacherByStudent = new Map(
    activeAssignments.map((assignment) => [
      assignment.studentId,
      assignment.teacherName ?? "a teacher",
    ])
  );

  const listError =
    teachersQuery.error ?? studentsQuery.error ?? assignmentsQuery.error;

  const assignMutation = useMutation({
    mutationFn: () => assignStudentToTeacher(teacherId, studentId),
    onSuccess: async (assignment) => {
      showToast(
        `${assignment.studentName ?? "Student"} is now assigned to ${assignment.teacherName ?? "the teacher"}.`,
        "success"
      );
      setTeacherId("");
      setStudentId("");
      await queryClient.invalidateQueries({
        queryKey: ["teacher-student-assignments"],
      });
    },
    onError: (mutationError) => {
      if (!(mutationError instanceof ApiError)) {
        showToast(
          queryError(mutationError, "Unable to create the assignment."),
          "error"
        );
      }
    },
  });

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (assignMutation.isPending) return;
    if (!teacherId || !studentId) {
      showToast("Choose both a teacher and a student.", "error");
      return;
    }
    assignMutation.mutate();
  };

  if (!canManage) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Admin access is required to manage assignments.
      </main>
    );
  }

  const listsLoading = teachersQuery.isLoading || studentsQuery.isLoading;

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
            Connect each student to a teacher. Assigning a new teacher replaces
            the student&apos;s current teacher.
          </p>
        </div>

        <section className="mb-10 rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
          <div className="mb-5 flex items-center gap-3">
            <UserCheck className="text-green-600 dark:text-green-400" />
            <h2 className="text-2xl font-semibold">Assign a student</h2>
          </div>

          {listError && (
            <p
              role="alert"
              className="mb-5 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
            >
              {queryError(
                listError,
                "Unable to load teachers, students, or assignments."
              )}
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end"
          >
            <div>
              <label
                htmlFor="assignment-teacher"
                className="block text-sm font-semibold mb-2"
              >
                Teacher
              </label>
              <SelectField
                id="assignment-teacher"
                value={teacherId}
                onChange={setTeacherId}
                placeholder={
                  teachersQuery.isLoading
                    ? "Loading teachers…"
                    : "Choose a teacher"
                }
                disabled={listsLoading}
                options={teachers.map((teacher) => ({
                  value: teacher.id,
                  label: teacher.fullName ?? teacher.name ?? teacher.email,
                }))}
              />
            </div>
            <div>
              <label
                htmlFor="assignment-student"
                className="block text-sm font-semibold mb-2"
              >
                Student
              </label>
              <SelectField
                id="assignment-student"
                value={studentId}
                onChange={setStudentId}
                placeholder={
                  studentsQuery.isLoading
                    ? "Loading students…"
                    : "Choose a student"
                }
                disabled={listsLoading}
                options={students.map((student) => {
                  const currentTeacher = currentTeacherByStudent.get(
                    student.id
                  );
                  return {
                    value: student.id,
                    label: `${student.fullName ?? student.name ?? student.email}${currentTeacher ? ` — with ${currentTeacher}` : ""}`,
                  };
                })}
              />
            </div>
            <button
              type="submit"
              disabled={assignMutation.isPending || listsLoading}
              className="rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
            >
              {assignMutation.isPending ? "Assigning…" : "Assign"}
            </button>
          </form>

          {!listsLoading && !teachers.length && !listError && (
            <p className="mt-4 text-sm text-foreground opacity-70">
              No teachers yet.{" "}
              <Link
                href="/admin/teachers"
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-400 underline"
              >
                Create a teacher first.
              </Link>
            </p>
          )}
          {!listsLoading && !students.length && !listError && (
            <p className="mt-4 text-sm text-foreground opacity-70">
              No students yet.{" "}
              <Link
                href="/admin/students"
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-400 underline"
              >
                Create a student first.
              </Link>
            </p>
          )}
        </section>

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
