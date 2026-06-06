"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types/user";

const roleRoutes: Record<string, string> = {
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student-dashboard",
  parent: "/parent/dashboard",
};

export const useRoleRedirect = (profile: UserProfile | null) => {
  const router = useRouter();

  useEffect(() => {
    if (!profile) return;
    const route = roleRoutes[profile.role] ?? "/login";
    router.push(route);
  }, [profile, router]);
};
