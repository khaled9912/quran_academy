import type { UserRole } from "@/types/user";
export const permissions: Record<UserRole, string[]> = {
  super_admin: ["*"],
  admin: [
    "manage_students",
    "manage_teachers",
    "manage_assignments",
    "manage_lessons",
    "view_reports",
    "review_transcripts",
  ],
  teacher: ["view_students", "view_lessons"],
  student: ["view_lessons"],
  support: ["review_transcripts"],
};
/** UI helper only. The .NET API must enforce all permissions. */
export function hasPermission(
  role: UserRole | null | undefined,
  permission: string
): boolean {
  if (!role) return false;
  const userPermissions = permissions[role];
  return (
    !!userPermissions &&
    (userPermissions.includes("*") || userPermissions.includes(permission))
  );
}
