export interface NavLink {
  label: string;
  href: string;
}

export const navigationConfig: Record<string, NavLink[]> = {
  anonymous: [
    { label: "Home", href: "/" },
    { label: "Our approach", href: "/#approach" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Contact", href: "/contact" },
  ],
  student: [
    { label: "Dashboard", href: "/student/dashboard" },
    { label: "Book a lesson", href: "/student/availability" },
    { label: "My schedule", href: "/schedule" },
  ],
  teacher: [
    { label: "Dashboard", href: "/teacher/dashboard" },
    { label: "Availability", href: "/teacher/availability" },
    { label: "Lesson requests", href: "/teacher/lesson-requests" },
    { label: "Schedule", href: "/teacher/schedule" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Students", href: "/admin/students" },
    { label: "Teachers", href: "/admin/teachers" },
    { label: "Assignments", href: "/admin/assignments" },
    { label: "Approvals", href: "/admin/lesson-approvals" },
  ],
  super_admin: [
    { label: "Dashboard", href: "/super-admin/dashboard" },
    { label: "Students", href: "/admin/students" },
    { label: "Teachers", href: "/admin/teachers" },
    { label: "Assignments", href: "/admin/assignments" },
    { label: "Approvals", href: "/admin/lesson-approvals" },
  ],
};
