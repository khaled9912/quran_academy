"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types/user";
import { ROLE_DASHBOARDS } from "@/constants/role-routes";

export const useRoleRedirect = (profile: UserProfile | null) => {
  const router = useRouter();

  useEffect(() => {
    if (!profile) return;
    const route = ROLE_DASHBOARDS[profile.role] ?? "/login";
    router.push(route);
  }, [profile, router]);
};
