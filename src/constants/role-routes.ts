import type { UserRole } from "@/types/user";

/**
 * Canonical post-login destination for each role. Single source of truth used
 * by the login flow, the AutoRedirect helper and the useRoleRedirect hook so
 * they can never drift out of sync.
 */
export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  super_admin: "/super-admin/dashboard",
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
};

export const DEFAULT_DASHBOARD = ROLE_DASHBOARDS.student;
