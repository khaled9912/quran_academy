import { navigationConfig } from "@/constants/navigation";
import type { UserRole } from "@/types/user";

/**
 * Role-based sidebar configuration.
 *
 * Derived from the existing `navigationConfig` (single source of truth) so the
 * sidebar and the top navigation can never drift apart. Each entry is the link
 * label for that role; use `navigationConfig[role]` when you also need hrefs.
 */
export const sidebarConfig: Record<UserRole, string[]> = {
  student: navigationConfig.student.map((l) => l.label),
  teacher: navigationConfig.teacher.map((l) => l.label),
  admin: navigationConfig.admin.map((l) => l.label),
  super_admin: navigationConfig.super_admin.map((l) => l.label),
};

export default sidebarConfig;
