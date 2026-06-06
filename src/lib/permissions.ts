import type { UserRole } from "@/types/user";

export const permissions: Record<UserRole, string[]> = {
  super_admin: ["*"],
  admin: [
    "manage_students",
    "manage_teachers",
    "manage_courses",
    "manage_payments",
    "view_reports",
    "manage_users",
  ],
  teacher: [
    "view_students",
    "mark_attendance",
    "create_assignments",
    "view_reports",
    "manage_sessions",
  ],
  student: [
    "view_courses",
    "submit_homework",
    "view_attendance",
    "view_reports",
  ],
  parent: [
    "view_child_attendance",
    "view_progress",
    "view_reports",
    "view_payment_status",
  ],
};

export const hasPermission = (role: UserRole | null, permission: string) => {
  if (!role) return false;
  if (role === "super_admin") return true;
  return permissions[role]?.includes(permission) ?? false;
};

export const roleRedirects: Record<UserRole | "anonymous", string> = {
  anonymous: "/login",
  super_admin: "/super-admin/dashboard",
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student-dashboard",
  parent: "/parent/dashboard",
};
