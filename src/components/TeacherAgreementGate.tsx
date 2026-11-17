"use client";

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

  // Only a confirmed missing acceptance redirects; while the query is still
  // pending an already-signed teacher must not be bounced to /policy.
  useEffect(() => {
    if (blocked) router.replace("/policy");
  }, [blocked, router]);

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
}
