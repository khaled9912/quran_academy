"use client";

import type { UserRole } from "@/types/user";
import { ROLE_DASHBOARDS, DEFAULT_DASHBOARD } from "@/constants/role-routes";

interface RouterLike {
  push: (href: string) => void;
}

/**
 * Redirects a user to the correct dashboard for their role after login.
 */
export const redirectAfterLogin = (role: UserRole, router: RouterLike) => {
  router.push(ROLE_DASHBOARDS[role] ?? DEFAULT_DASHBOARD);
};
