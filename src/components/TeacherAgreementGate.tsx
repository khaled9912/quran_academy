"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Signature } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { getPolicyState } from "@/services/policy.service";
import { useAuth } from "@/providers/auth-provider";

export function TeacherAgreementGate({
  children,
}: {
  children: ReactNode;
}) {
  const { role, isAuthenticated } = useAuth();
  const router = useRouter();

  const query = useQuery({
    queryKey: ["policy-state"],
    queryFn: getPolicyState,
    enabled: isAuthenticated && role === "teacher",
    staleTime: 30_000,
  });

  const required = query.data?.required ?? false;
  const accepted = query.data?.accepted ?? false;
  const blocked = role === "teacher" && required && !accepted;
  const pending = role === "teacher" && (query.isPending || query.isLoading || !query.data);

  useEffect(() => {
    if (role === "teacher" && (blocked || pending)) {
      router.replace("/policy");
    }
  }, [blocked, pending, role, router]);

  if (role !== "teacher") return <>{children}</>;

  if (pending) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-5 py-16 text-foreground">
        <div className="rounded-3xl border border-card-border bg-card-bg p-8 text-center shadow-sm">
          <Signature className="mx-auto text-amber-700 dark:text-amber-300" />
          <p className="mt-4 text-lg font-semibold">Checking your academy agreement…</p>
        </div>
      </main>
    );
  }

  if (blocked) return null;

  return <>{children}</>;

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-5 py-16 text-foreground">
      <div className="w-full rounded-3xl border border-amber-300 bg-amber-500/10 p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-amber-700 dark:text-amber-300">
          Action required
        </p>
        <h1 className="mt-3 text-3xl font-bold">Accept the academy agreement</h1>
        <p className="mt-3 text-foreground/75">
          You cannot access the teacher portal until the agreement is reviewed and
          accepted on the same page.
        </p>
        <Link
          href="/policy"
          className="mt-6 inline-flex rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          Review and accept
        </Link>
      </div>
    </main>
  );
}
