"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Pencil, UserPlus } from "lucide-react";
import { createTeacher, getTeachers } from "@/services/teacher.service";
import {
  deactivateManagedUser,
  updateManagedUser,
} from "@/services/admin-user.service";
import { useAuth } from "@/providers/auth-provider";

const inputClass =
  "w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500";

export default function AdminTeachersPage() {
  const { role } = useAuth();
  const canManage = role === "admin" || role === "super_admin";
  const queryClient = useQueryClient();
  const teachersQuery = useQuery({
    queryKey: ["teachers", "all"],
    queryFn: () => getTeachers(true),
    enabled: canManage,
  });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const createMutation = useMutation({
    mutationFn: createTeacher,
    onSuccess: async (teacher) => {
      setNotice(
        `${teacher.fullName ?? teacher.name ?? teacher.email} was created.`
      );
      setFullName("");
      setEmail("");
      setPassword("");
      await queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to create the teacher."
      );
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
      setNotice("Teacher updated.");
      setEditingId(null);
      await queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to update the teacher."
      );
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive
        ? deactivateManagedUser(id)
        : updateManagedUser(id, { isActive: true }),
    onSuccess: async (_, variables) => {
      setNotice(
        variables.isActive
          ? "Teacher deactivated. Their assignments were removed."
          : "Teacher reactivated."
      );
      await queryClient.invalidateQueries({ queryKey: ["teachers"] });
      await queryClient.invalidateQueries({
        queryKey: ["teacher-student-assignments"],
      });
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to change the teacher status."
      );
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (createMutation.isPending) return;
    setError("");
    setNotice("");
    if (!fullName.trim() || !email.trim()) {
      setError("Full name and email are required.");
      return;
    }
    if (password.length < 8) {
      setError("The temporary password must be at least 8 characters.");
      return;
    }
    createMutation.mutate({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
    });
  };

  const startEdit = (id: string, name: string, teacherEmail: string) => {
    setError("");
    setNotice("");
    setEditingId(id);
    setEditName(name);
    setEditEmail(teacherEmail);
    setEditPassword("");
  };

  const saveEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId || updateMutation.isPending) return;
    setError("");
    setNotice("");
    if (!editName.trim() || !editEmail.trim()) {
      setError("Full name and email are required.");
      return;
    }
    if (editPassword && editPassword.length < 8) {
      setError("A new password must be at least 8 characters.");
      return;
    }
    updateMutation.mutate({
      id: editingId,
      fullName: editName.trim(),
      email: editEmail.trim(),
      password: editPassword,
    });
  };

  if (!canManage) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Admin access is required to manage teachers.
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
          <h1 className="text-4xl font-bold mb-2">Teachers</h1>
          <p className="text-lg text-foreground opacity-75">
            Create, edit, deactivate teacher accounts and publish weekly
            availability on their behalf.
          </p>
        </div>

        <section className="mb-10 rounded-3xl border border-card-border bg-card-bg p-6 md:p-8">
          <div className="mb-5 flex items-center gap-3">
            <UserPlus className="text-green-600 dark:text-green-400" />
            <h2 className="text-2xl font-semibold">Create a teacher</h2>
          </div>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <label
                htmlFor="teacher-name"
                className="block text-sm font-semibold mb-2"
              >
                Full name
              </label>
              <input
                id="teacher-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="teacher-email"
                className="block text-sm font-semibold mb-2"
              >
                Email
              </label>
              <input
                id="teacher-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="teacher-password"
                className="block text-sm font-semibold mb-2"
              >
                Temporary password
              </label>
              <input
                id="teacher-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating…" : "Create teacher"}
              </button>
            </div>
          </form>
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300"
            >
              {error}
            </p>
          )}
          {notice && (
            <p
              role="status"
              className="mt-4 rounded-xl bg-green-50 dark:bg-green-500/10 p-3 text-sm text-green-800 dark:text-green-300"
            >
              {notice}
            </p>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Teacher accounts</h2>
          {teachersQuery.isLoading ? (
            <p className="text-foreground opacity-70">Loading teachers…</p>
          ) : teachersQuery.error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
            >
              {teachersQuery.error instanceof Error
                ? teachersQuery.error.message
                : "Unable to load teachers."}
            </p>
          ) : teachersQuery.data?.length ? (
            <div className="space-y-4">
              {teachersQuery.data.map((teacher) => {
                const active = teacher.isActive !== false;
                return (
                  <div
                    key={teacher.id}
                    className="rounded-3xl border border-card-border bg-card-bg p-6"
                  >
                    {editingId === teacher.id ? (
                      <form
                        onSubmit={saveEdit}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        <div>
                          <label
                            htmlFor={`edit-name-${teacher.id}`}
                            className="block text-sm font-semibold mb-2"
                          >
                            Full name
                          </label>
                          <input
                            id={`edit-name-${teacher.id}`}
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
                            htmlFor={`edit-email-${teacher.id}`}
                            className="block text-sm font-semibold mb-2"
                          >
                            Email
                          </label>
                          <input
                            id={`edit-email-${teacher.id}`}
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
                            htmlFor={`edit-password-${teacher.id}`}
                            className="block text-sm font-semibold mb-2"
                          >
                            New password (optional)
                          </label>
                          <input
                            id={`edit-password-${teacher.id}`}
                            type="password"
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
                          <p className="text-xl font-semibold">
                            {teacher.fullName ?? teacher.name}
                          </p>
                          <p className="text-foreground opacity-75">
                            {teacher.email}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-semibold ${active ? "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300" : "bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300"}`}
                          >
                            {active ? "Active" : "Inactive"}
                          </span>
                          <button
                            onClick={() =>
                              startEdit(
                                teacher.id,
                                teacher.fullName ?? teacher.name,
                                teacher.email
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm font-semibold hover:border-green-500"
                          >
                            <Pencil size={15} /> Edit
                          </button>
                          {active && (
                            <Link
                              href={`/admin/teachers/${teacher.id}/availability`}
                              className="inline-flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm font-semibold hover:border-green-500"
                            >
                              <CalendarPlus size={15} /> Weekly times
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              if (
                                !active ||
                                window.confirm(
                                  "Deactivate this teacher? Their assignments and weekly times will be removed."
                                )
                              ) {
                                setError("");
                                setNotice("");
                                statusMutation.mutate({
                                  id: teacher.id,
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
              No teacher accounts yet. Create the first teacher above.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
