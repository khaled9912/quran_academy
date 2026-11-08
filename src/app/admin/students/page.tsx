"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, UserPlus } from "lucide-react";
import { createStudent, getStudents } from "@/services/student.service";
import { getTeachers } from "@/services/teacher.service";
import {
  assignStudentToTeacher,
  getTeacherStudentAssignments,
  removeTeacherStudentAssignment,
} from "@/services/assignment.service";
import {
  deactivateManagedUser,
  updateManagedUser,
} from "@/services/admin-user.service";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { ApiError } from "@/lib/backend-client";
import { SelectField } from "@/components/ui/select-field";
import { PasswordField } from "@/components/ui/password-field";
import { GRADE_OPTIONS } from "@/lib/grades";

const inputClass =
  "w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500";

export default function AdminStudentsPage() {
  const { role } = useAuth();
  const { showToast } = useToast();
  const canManage = role === "admin" || role === "super_admin";
  const queryClient = useQueryClient();
  const studentsQuery = useQuery({
    queryKey: ["students", "all"],
    queryFn: () => getStudents(true),
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

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [grade, setGrade] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: async (student) => {
      showToast(
        `${student.fullName ?? student.name ?? student.email} was created.`,
        "success"
      );
      setFullName("");
      setEmail("");
      setPassword("");
      setGrade("");
      await queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (mutationError) => {
      if (!(mutationError instanceof ApiError)) {
        showToast("Unable to create the student.", "error");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      fullName,
      email,
      password,
    }: {
      id: string;
      fullName: string;
      email: string;
      password: string;
    }) =>
      updateManagedUser(id, {
        fullName,
        email,
        ...(password ? { password } : {}),
      }),
    onSuccess: async () => {
      showToast("Student updated.", "success");
      setEditingId(null);
      await queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (mutationError) => {
      if (!(mutationError instanceof ApiError)) {
        showToast("Unable to update the student.", "error");
      }
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive
        ? deactivateManagedUser(id)
        : updateManagedUser(id, { isActive: true }),
    onSuccess: async (_, variables) => {
      showToast(
        variables.isActive
          ? "Student deactivated. Their assignment was removed."
          : "Student reactivated.",
        "success"
      );
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      await queryClient.invalidateQueries({
        queryKey: ["teacher-student-assignments"],
      });
    },
    onError: (mutationError) => {
      if (!(mutationError instanceof ApiError)) {
        showToast("Unable to change the student status.", "error");
      }
    },
  });

  const assignmentMutation = useMutation({
    mutationFn: async ({
      studentId,
      teacherId,
    }: {
      studentId: string;
      teacherId: string;
    }) => {
      const current = (assignmentsQuery.data ?? []).find(
        (assignment) =>
          assignment.status === "active" && assignment.studentId === studentId
      );
      if (!teacherId)
        return current ? removeTeacherStudentAssignment(current.id) : null;
      if (current?.teacherId === teacherId) return current;
      return assignStudentToTeacher(teacherId, studentId);
    },
    onSuccess: async (_, variables) => {
      showToast(
        variables.teacherId
          ? "Teacher assignment saved."
          : "Student unassigned.",
        "success"
      );
      await queryClient.invalidateQueries({
        queryKey: ["teacher-student-assignments"],
      });
    },
    onError: (mutationError) => {
      if (!(mutationError instanceof ApiError)) {
        showToast("Unable to change the teacher assignment.", "error");
      }
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (createMutation.isPending) return;
    if (!fullName.trim() || !email.trim()) {
      showToast("Full name and email are required.", "error");
      return;
    }
    if (password.length < 8) {
      showToast(
        "The temporary password must be at least 8 characters.",
        "error"
      );
      return;
    }
    createMutation.mutate({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      grade: grade || undefined,
    });
  };

  const startEdit = (id: string, name: string, studentEmail: string) => {
    setEditingId(id);
    setEditName(name);
    setEditEmail(studentEmail);
    setEditPassword("");
  };

  const saveEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId || updateMutation.isPending) return;
    if (!editName.trim() || !editEmail.trim()) {
      showToast("Full name and email are required.", "error");
      return;
    }
    if (editPassword && editPassword.length < 8) {
      showToast("A new password must be at least 8 characters.", "error");
      return;
    }
    updateMutation.mutate({
      id: editingId,
      fullName: editName.trim(),
      email: editEmail.trim(),
      password: editPassword,
    });
  };

  const teachers = teachersQuery.data ?? [];
  const activeAssignmentByStudent = new Map(
    (assignmentsQuery.data ?? [])
      .filter((assignment) => assignment.status === "active")
      .map((assignment) => [assignment.studentId, assignment])
  );

  if (!canManage) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Admin access is required to manage students.
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
          <h1 className="text-4xl font-bold mb-2">Students</h1>
          <p className="text-lg text-foreground opacity-75">
            Create, edit, and deactivate student accounts.
          </p>
        </div>

        <section className="mb-10 rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
          <div className="mb-5 flex items-center gap-3">
            <UserPlus className="text-green-600 dark:text-green-400" />
            <h2 className="text-2xl font-semibold">Create a student</h2>
          </div>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label
                htmlFor="student-name"
                className="block text-sm font-semibold mb-2"
              >
                Full name
              </label>
              <input
                id="student-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="student-email"
                className="block text-sm font-semibold mb-2"
              >
                Email
              </label>
              <input
                id="student-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="student-password"
                className="block text-sm font-semibold mb-2"
              >
                Temporary password
              </label>
              <PasswordField
                id="student-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="student-grade"
                className="block text-sm font-semibold mb-2"
              >
                Grade (optional)
              </label>
              <SelectField
                id="student-grade"
                value={grade}
                onChange={setGrade}
                selectedLabel={
                  grade
                    ? (GRADE_OPTIONS.find((option) => option.value === grade)
                        ?.short ?? grade)
                    : "No grade"
                }
                options={[
                  { value: "", label: "No grade" },
                  ...GRADE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  })),
                ]}
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating…" : "Create student"}
              </button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Student accounts</h2>
          {studentsQuery.isLoading ? (
            <p className="text-foreground opacity-70">Loading students…</p>
          ) : studentsQuery.error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
            >
              {studentsQuery.error instanceof Error
                ? studentsQuery.error.message
                : "Unable to load students."}
            </p>
          ) : studentsQuery.data?.length ? (
            <div className="space-y-4">
              {studentsQuery.data.map((student) => {
                const active = student.isActive !== false;
                const name = student.fullName ?? student.name;
                const assignment = activeAssignmentByStudent.get(student.id);
                const savingAssignment =
                  assignmentMutation.isPending &&
                  assignmentMutation.variables?.studentId === student.id;
                return (
                  <div
                    key={student.id}
                    className="rounded-3xl border border-card-border bg-card-bg p-6"
                  >
                    {editingId === student.id ? (
                      <form
                        onSubmit={saveEdit}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        <div>
                          <label
                            htmlFor={`edit-name-${student.id}`}
                            className="block text-sm font-semibold mb-2"
                          >
                            Full name
                          </label>
                          <input
                            id={`edit-name-${student.id}`}
                            value={editName}
                            onChange={(event) =>
                              setEditName(event.target.value)
                            }
                            required
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`edit-email-${student.id}`}
                            className="block text-sm font-semibold mb-2"
                          >
                            Email
                          </label>
                          <input
                            id={`edit-email-${student.id}`}
                            type="email"
                            value={editEmail}
                            onChange={(event) =>
                              setEditEmail(event.target.value)
                            }
                            required
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`edit-password-${student.id}`}
                            className="block text-sm font-semibold mb-2"
                          >
                            New password (optional)
                          </label>
                          <PasswordField
                            id={`edit-password-${student.id}`}
                            value={editPassword}
                            onChange={(event) =>
                              setEditPassword(event.target.value)
                            }
                            className={inputClass}
                          />
                        </div>
                        <div className="md:col-span-3 flex gap-2">
                          <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="rounded-xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            {updateMutation.isPending
                              ? "Saving…"
                              : "Save changes"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-xl border border-card-border px-5 py-2.5 text-sm font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-xl font-semibold">{name}</p>
                          <p className="text-foreground opacity-75">
                            {student.email}
                          </p>
                          {student.grade && (
                            <p className="mt-1 text-sm text-foreground opacity-60">
                              Grade: {student.grade}
                            </p>
                          )}
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                            <label
                              htmlFor={`student-teacher-${student.id}`}
                              className="font-semibold opacity-80"
                            >
                              Teacher
                            </label>
                            <SelectField
                              id={`student-teacher-${student.id}`}
                              size="sm"
                              className="min-w-[10rem] flex-1 sm:flex-none sm:min-w-[12rem]"
                              value={assignment?.teacherId ?? ""}
                              disabled={!active || savingAssignment}
                              onChange={(value) => {
                                assignmentMutation.mutate({
                                  studentId: student.id,
                                  teacherId: value,
                                });
                              }}
                              options={[
                                { value: "", label: "Unassigned" },
                                ...teachers.map((teacher) => ({
                                  value: teacher.id,
                                  label:
                                    teacher.fullName ??
                                    teacher.name ??
                                    teacher.email,
                                })),
                              ]}
                            />
                            {savingAssignment && (
                              <span className="opacity-60">Saving…</span>
                            )}
                            {!active && (
                              <span className="text-amber-800 dark:text-amber-300 opacity-80">
                                Reactivate to assign a teacher.
                              </span>
                            )}
                          </div>
                          {teachersQuery.error && (
                            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                              {teachersQuery.error instanceof Error
                                ? teachersQuery.error.message
                                : "Unable to load teachers."}
                            </p>
                          )}
                          {!teachersQuery.isLoading &&
                            !teachersQuery.error &&
                            !teachers.length && (
                              <p className="mt-2 text-sm opacity-70">
                                No teachers yet.{" "}
                                <Link
                                  href="/admin/teachers"
                                  className="text-green-600 dark:text-green-400 underline"
                                >
                                  Create a teacher
                                </Link>{" "}
                                to assign one.
                              </p>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-semibold ${active ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400" : "bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300"}`}
                          >
                            {active ? "Active" : "Inactive"}
                          </span>
                          <button
                            onClick={() =>
                              startEdit(student.id, name, student.email)
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm font-semibold hover:border-green-500"
                          >
                            <Pencil size={15} /> Edit
                          </button>
                          <button
                            onClick={() => {
                              if (
                                !active ||
                                window.confirm(
                                  "Deactivate this student? Their assignment and open requests will be removed."
                                )
                              ) {
                                statusMutation.mutate({
                                  id: student.id,
                                  isActive: active,
                                });
                              }
                            }}
                            disabled={statusMutation.isPending}
                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${active ? "border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white" : "bg-green-500 text-white hover:bg-green-600"}`}
                          >
                            {active ? "Deactivate" : "Reactivate"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-card-border bg-card-bg p-10 text-center text-foreground opacity-70">
              No students yet. Create the first student account above.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
