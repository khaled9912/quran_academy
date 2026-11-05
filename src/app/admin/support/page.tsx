"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, UserX } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  createSupportUser,
  deactivateManagedUser,
  getSupportUsers,
  updateManagedUser,
  type AdminManagedUser,
} from "@/services/admin-user.service";

const inputClass =
  "w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:border-green-500 focus:outline-none";

export default function AdminSupportPage() {
  const { role } = useAuth();
  const canManage = role === "admin" || role === "super_admin";
  const queryClient = useQueryClient();

  const supportQuery = useQuery({
    queryKey: ["support-users"],
    queryFn: getSupportUsers,
    enabled: canManage,
  });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const createMutation = useMutation({
    mutationFn: createSupportUser,
    onSuccess: async (user) => {
      setError("");
      setNotice(`${user.fullName ?? user.email} can now review lessons.`);
      setFullName("");
      setEmail("");
      setPassword("");
      await queryClient.invalidateQueries({ queryKey: ["support-users"] });
    },
    onError: (mutationError) => {
      setNotice("");
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to create the support account."
      );
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive
        ? deactivateManagedUser(id)
        : updateManagedUser(id, { isActive: true }),
    onSuccess: async (_, variables) => {
      setError("");
      setNotice(
        variables.isActive
          ? "Support account deactivated. Existing reviews are kept."
          : "Support account reactivated."
      );
      await queryClient.invalidateQueries({ queryKey: ["support-users"] });
    },
    onError: (mutationError) => {
      setNotice("");
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to change the support account."
      );
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (createMutation.isPending) return;
    setError("");
    setNotice("");
    if (!fullName.trim() || !email.trim() || password.length < 8) {
      setError(
        "Enter a name, an email and a password of at least 8 characters."
      );
      return;
    }
    createMutation.mutate({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
    });
  };

  if (!canManage) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        Admin access is required to manage the support team.
      </main>
    );
  }

  const supportUsers: AdminManagedUser[] = supportQuery.data ?? [];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 text-foreground">
      <div className="mx-auto max-w-5xl px-4 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Support team</h1>
          <p className="text-lg text-foreground opacity-75">
            Support accounts can read lesson transcripts, submit reviews and see
            the weekly digest. They cannot change lessons, students or teachers.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-3xl border border-card-border bg-card-bg p-6"
        >
          <h2 className="mb-4 text-lg font-semibold">Add a reviewer</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              className={inputClass}
              placeholder="Full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
            />
            <input
              className={inputClass}
              placeholder="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
            <input
              className={inputClass}
              placeholder="Temporary password (min 8)"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            <UserPlus size={16} />
            {createMutation.isPending ? "Creating…" : "Create support account"}
          </button>
          {error ? (
            <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="mt-4 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              {notice}
            </p>
          ) : null}
        </form>

        <section className="rounded-3xl border border-card-border bg-card-bg p-6">
          <h2 className="mb-4 text-lg font-semibold">Current reviewers</h2>
          {supportQuery.isLoading ? (
            <p className="opacity-70">Loading support accounts…</p>
          ) : supportQuery.isError ? (
            <p className="opacity-70">Support accounts could not be loaded.</p>
          ) : supportUsers.length === 0 ? (
            <p className="opacity-70">
              No support accounts yet. Add one above to start the weekly review.
            </p>
          ) : (
            <ul className="divide-y divide-card-border">
              {supportUsers.map((user) => {
                const active = user.isActive !== false;
                return (
                  <li
                    key={user.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-4"
                  >
                    <div>
                      <p className="font-semibold">
                        {user.fullName ?? user.name ?? user.email}
                      </p>
                      <p className="text-sm opacity-70">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          active
                            ? "bg-green-500/15 text-green-700"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {active ? "Active" : "Inactive"}
                      </span>
                      <button
                        type="button"
                        disabled={statusMutation.isPending}
                        onClick={() =>
                          statusMutation.mutate({
                            id: user.id,
                            isActive: active,
                          })
                        }
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-60 ${
                          active
                            ? "border-red-500/40 text-red-600 dark:text-red-400 hover:border-red-500"
                            : "border-card-border hover:border-green-500"
                        }`}
                      >
                        {active ? <UserX size={15} /> : null}
                        {active ? "Deactivate" : "Reactivate"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
