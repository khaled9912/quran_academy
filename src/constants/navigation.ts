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
    { label: "Teachers", href: "/teachers" },
    { label: "My schedule", href: "/schedule" },
    { label: "Profile", href: "/profile" },
  ],
  teacher: [
    { label: "Dashboard", href: "/teacher/dashboard" },
    { label: "Availability", href: "/teacher/availability" },
    { label: "Schedule", href: "/teacher/schedule" },
    { label: "Profile", href: "/profile" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Students", href: "/admin/students" },
    { label: "Teachers", href: "/admin/teachers" },
    { label: "Assignments", href: "/admin/assignments" },
    { label: "Time changes", href: "/admin/change-requests" },
    { label: "Lessons", href: "/admin/lessons" },
    { label: "Transcripts", href: "/admin/transcripts" },
    { label: "Profile", href: "/profile" },
  ],
  super_admin: [
    { label: "Dashboard", href: "/super-admin/dashboard" },
    { label: "Students", href: "/admin/students" },
    { label: "Teachers", href: "/admin/teachers" },
    { label: "Assignments", href: "/admin/assignments" },
    { label: "Time changes", href: "/admin/change-requests" },
    { label: "Lessons", href: "/admin/lessons" },
    { label: "Transcripts", href: "/admin/transcripts" },
    { label: "Profile", href: "/profile" },
  ],
};
