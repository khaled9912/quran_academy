import { UserRole } from "@/types/user";

export const permissions: Record<UserRole, string[]> = {
  super_admin: ["*"],

  admin: [
    "manage_students",
    "manage_teachers",
    "manage_courses",
    "view_reports",
  ],

  teacher: ["view_students", "mark_attendance", "create_assignments"],

  student: ["view_courses", "submit_homework"],
};

/**
 * Checks if a role has the specified permission.
 * Wildcard "*" allows access to all permissions (used by super_admin).
 */
export function hasPermission(
  role: UserRole | null | undefined,
  permission: string
): boolean {
  if (!role) return false;
  const userPermissions = permissions[role];
  if (!userPermissions) return false;
  if (userPermissions.includes("*")) return true;
  return userPermissions.includes(permission);
}
