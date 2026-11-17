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
  deleteManagedUser,
  updateManagedUser,
} from "@/services/admin-user.service";
import { getPendingStudents } from "@/services/onboarding.service";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { ApiError } from "@/lib/backend-client";
import { SelectField } from "@/components/ui/select-field";
import { PasswordField } from "@/components/ui/password-field";
import { FieldError } from "@/components/ui/field-error";
import { GRADE_OPTIONS } from "@/lib/grades";

const inputClass =
  "w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500";

const mismatchMessage = "The passwords do not match.";

// Both run on every keystroke, so a wrong confirmation is reported as it is
// typed. The create form always needs a password; the edit form only does when
// the admin means to change it.
const temporaryPasswordError = (password: string, confirm: string) =>
  !confirm
    ? "Confirm the temporary password."
    : confirm === password
      ? ""
      : mismatchMessage;

const newPasswordError = (password: string, confirm: string) => {
  if (!password && !confirm) return "";
  if (!password) return "Enter the new password in both fields.";
  if (!confirm) return "Confirm the new password.";
  return confirm === password ? "" : mismatchMessage;
};

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
  // The plan each student asked for and how much of it is already placed.
  const pendingQuery = useQuery({
    queryKey: ["students", "pending"],
    queryFn: getPendingStudents,
    enabled: canManage,
  });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChecked, setPasswordChecked] = useState(false);
  const [grade, setGrade] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [editPasswordChecked, setEditPasswordChecked] = useState(false);
  const [confirming, setConfirming] = useState<{
    id: string;
    action: "deactivate" | "delete";
  } | null>(null);

  const createConfirmError =
    passwordChecked || confirmPassword
      ? temporaryPasswordError(password, confirmPassword)
      : "";

  const editConfirmError =
    editPasswordChecked || editConfirmPassword
      ? newPasswordError(editPassword, editConfirmPassword)
      : "";

  const errorClass = (message: string) =>
    `${inputClass} ${message ? "border-red-400" : ""}`;

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
      setConfirmPassword("");
      setPasswordChecked(false);
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
      setConfirming(null);
      showToast(
        variables.isActive
          ? "Student deactivated. Sign-in is blocked; their bookings are kept."
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteManagedUser(id),
    onSuccess: async () => {
      setConfirming(null);
      showToast(
        "Student deleted. Their booked lessons were released and the teacher's weekly times are open again.",
        "success"
      );
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      await queryClient.invalidateQueries({
        queryKey: ["teacher-student-assignments"],
      });
    },
    onError: (mutationError) => {
      if (!(mutationError instanceof ApiError)) {
        showToast("Unable to delete the student.", "error");
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
    if (temporaryPasswordError(password, confirmPassword)) {
      setPasswordChecked(true);
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
    setEditConfirmPassword("");
    setEditPasswordChecked(false);
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
    if (newPasswordError(editPassword, editConfirmPassword)) {
      setEditPasswordChecked(true);
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
  const planByStudent = new Map(
    (pendingQuery.data ?? [])
      .filter((student) => (student.onboarding?.planDaysPerWeek ?? 0) > 0)
      .map((student) => [
        student.studentId,
        {
          days: student.onboarding?.planDaysPerWeek ?? 0,
          booked: student.weeklyLessons.length,
        },
      ])
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
            Create, edit, deactivate or delete student accounts. Deleting
            releases their booked lessons and frees the teacher&apos;s weekly
            times.
          </p>
        </div>

        <section className="mb-10 rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
          <div className="mb-5 flex items-center gap-3">
            <UserPlus className="text-green-600 dark:text-green-400" />
            <h2 className="text-2xl font-semibold">Create a student</h2>
          </div>
          <form
            onSubmit={handleSubmit}
            autoComplete="off"
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
                autoComplete="off"
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
                autoComplete="off"
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
                autoComplete="new-password"
                required
                minLength={8}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="student-password-confirm"
                className="block text-sm font-semibold mb-2"
              >
                Confirm temporary password
              </label>
              <PasswordField
                id="student-password-confirm"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
                aria-invalid={createConfirmError ? true : undefined}
                className={errorClass(createConfirmError)}
              />
              <FieldError message={createConfirmError} />
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
                const deleted = Boolean(student.deletedAt);
                const active = student.isActive !== false && !deleted;
                const name = student.fullName ?? student.name;
                const assignment = activeAssignmentByStudent.get(student.id);
                const savingAssignment =
                  assignmentMutation.isPending &&
                  assignmentMutation.variables?.studentId === student.id;
                const statusBusy =
                  statusMutation.isPending &&
                  statusMutation.variables?.id === student.id;
                const deleteBusy =
                  deleteMutation.isPending &&
                  deleteMutation.variables === student.id;
                const rowBusy = statusBusy || deleteBusy;
                const rowConfirm =
                  confirming?.id === student.id ? confirming : null;
                // A plan is placed only when every weekly lesson in it has a
                // time, and that booking lives in the assignment desk.
                const plan = planByStudent.get(student.id);
                const planNote =
                  !assignment && plan && plan.booked < plan.days
                    ? `their ${plan.days}-day plan has ${plan.booked} of ${plan.days} weekly lessons booked.`
                    : "";
                return (
                  <div
                    key={student.id}
                    className="rounded-3xl border border-card-border bg-card-bg p-6"
                  >
                    {editingId === student.id ? (
                      <form
                        onSubmit={saveEdit}
                        autoComplete="off"
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
                            autoComplete="off"
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
                            autoComplete="off"
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
                            autoComplete="new-password"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`edit-password-confirm-${student.id}`}
                            className="block text-sm font-semibold mb-2"
                          >
                            Confirm new password
                          </label>
                          <PasswordField
                            id={`edit-password-confirm-${student.id}`}
                            value={editConfirmPassword}
                            onChange={(event) =>
                              setEditConfirmPassword(event.target.value)
                            }
                            autoComplete="new-password"
                            aria-invalid={editConfirmError ? true : undefined}
                            className={errorClass(editConfirmError)}
                          />
                          <FieldError message={editConfirmError} />
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
                      <div className="space-y-4">
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
                            {!deleted && (
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
                                  disabled={
                                    !active || savingAssignment || !!planNote
                                  }
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
                            )}
                            {!deleted && planNote && (
                              <p className="mt-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
                                <Link
                                  href="/admin/assignments"
                                  className="underline underline-offset-2"
                                >
                                  Open the assignment desk
                                </Link>{" "}
                                — {planNote}
                              </p>
                            )}
                            {teachersQuery.error && (
                              <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                                {teachersQuery.error instanceof Error
                                  ? teachersQuery.error.message
                                  : "Unable to load teachers."}
                              </p>
                            )}
                            {!deleted &&
                              !teachersQuery.isLoading &&
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
                              className={`rounded-full px-3 py-1 text-sm font-semibold ${deleted ? "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300" : active ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400" : "bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300"}`}
                            >
                              {deleted
                                ? "Deleted"
                                : active
                                  ? "Active"
                                  : "Deactivated"}
                            </span>
                            {deleted ? (
                              <button
                                onClick={() =>
                                  statusMutation.mutate({
                                    id: student.id,
                                    isActive: false,
                                  })
                                }
                                disabled={rowBusy}
                                className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
                              >
                                {statusBusy ? "Restoring…" : "Restore"}
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setConfirming(null);
                                    startEdit(student.id, name, student.email);
                                  }}
                                  disabled={rowBusy}
                                  className="inline-flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm font-semibold hover:border-green-500 disabled:opacity-50"
                                >
                                  <Pencil size={15} /> Edit
                                </button>
                                <button
                                  onClick={() =>
                                    active
                                      ? setConfirming({
                                          id: student.id,
                                          action: "deactivate",
                                        })
                                      : statusMutation.mutate({
                                          id: student.id,
                                          isActive: false,
                                        })
                                  }
                                  disabled={rowBusy}
                                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${active ? "border border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500 hover:text-white" : "bg-green-500 text-white hover:bg-green-600"}`}
                                >
                                  {statusBusy
                                    ? active
                                      ? "Deactivating…"
                                      : "Reactivating…"
                                    : active
                                      ? "Deactivate"
                                      : "Reactivate"}
                                </button>
                                <button
                                  onClick={() =>
                                    setConfirming({
                                      id: student.id,
                                      action: "delete",
                                    })
                                  }
                                  disabled={rowBusy}
                                  className="rounded-xl border border-red-300 dark:border-red-500/30 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                                >
                                  {deleteBusy ? "Deleting…" : "Delete"}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {rowConfirm && (
                          <div
                            role="alert"
                            className={`rounded-2xl border p-4 text-sm ${rowConfirm.action === "delete" ? "border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300" : "border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300"}`}
                          >
                            <p className="font-semibold">
                              {rowConfirm.action === "delete"
                                ? "Delete this student? Their booked lessons will be released and their teacher's weekly times open up again."
                                : "Deactivate this student? Sign-in is blocked, but their lessons, assignment and weekly times stay booked."}
                            </p>
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() =>
                                  rowConfirm.action === "delete"
                                    ? deleteMutation.mutate(student.id)
                                    : statusMutation.mutate({
                                        id: student.id,
                                        isActive: true,
                                      })
                                }
                                disabled={rowBusy}
                                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${rowConfirm.action === "delete" ? "bg-red-500 hover:bg-red-600" : "bg-amber-500 hover:bg-amber-600"}`}
                              >
                                {rowBusy
                                  ? rowConfirm.action === "delete"
                                    ? "Deleting…"
                                    : "Deactivating…"
                                  : rowConfirm.action === "delete"
                                    ? "Yes, delete"
                                    : "Yes, deactivate"}
                              </button>
                              <button
                                onClick={() => setConfirming(null)}
                                disabled={rowBusy}
                                className="rounded-xl border border-card-border px-4 py-2 text-sm font-semibold disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
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
