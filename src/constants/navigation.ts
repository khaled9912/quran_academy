export interface NavLink {
  label: string;
  href: string;
}

export const navigationConfig: Record<string, NavLink[]> = {
  anonymous: [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: "Teachers", href: "/teachers" },
    { label: "Login", href: "/login" },
    { label: "Register", href: "/register" },
  ],
  student: [
    { label: "Dashboard", href: "/student/dashboard" },
    { label: "Courses", href: "/courses" },
    { label: "Assignments", href: "/assignments" },
    { label: "Profile", href: "/profile" },
  ],
  teacher: [
    { label: "Dashboard", href: "/teacher/dashboard" },
    { label: "Students", href: "/teacher/students" },
    { label: "Attendance", href: "/teacher/attendance" },
    { label: "Assignments", href: "/assignments" },
    { label: "Profile", href: "/profile" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Students", href: "/admin/students" },
    { label: "Teachers", href: "/admin/teachers" },
    { label: "Courses", href: "/admin/courses" },
    { label: "Payments", href: "/invoices" },
    { label: "Reports", href: "/admin/reports" },
  ],
  super_admin: [
    { label: "Dashboard", href: "/super-admin/dashboard" },
    { label: "Admins", href: "/super-admin/admins" },
    { label: "Teachers", href: "/admin/teachers" },
    { label: "Students", href: "/admin/students" },
    { label: "Courses", href: "/admin/courses" },
    { label: "System Settings", href: "/super-admin/settings" },
    { label: "Audit Logs", href: "/super-admin/audit-logs" },
  ],
};
