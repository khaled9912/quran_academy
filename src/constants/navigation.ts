export interface NavLink {
  label: string;
  href: string;
}

export const navigationConfig: Record<string, NavLink[]> = {
  anonymous: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Courses", href: "/courses" },
    { label: "Blog", href: "/blog" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Contact", href: "/contact" },
  ],
  student: [
    { label: "Dashboard", href: "/student/dashboard" },
    { label: "Book a lesson", href: "/student/availability" },
    { label: "Teachers", href: "/teachers" },
    { label: "My schedule", href: "/schedule" },
    { label: "Payments", href: "/student/payments" },
    { label: "Profile", href: "/profile" },
  ],
  teacher: [
    { label: "Dashboard", href: "/teacher/dashboard" },
    { label: "Availability", href: "/teacher/availability" },
    { label: "Schedule", href: "/teacher/schedule" },
    { label: "Earnings", href: "/teacher/payments" },
    { label: "Profile", href: "/profile" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Students", href: "/admin/students" },
    { label: "Teachers", href: "/admin/teachers" },
    { label: "Assignments", href: "/admin/assignments" },
    { label: "Time changes", href: "/admin/change-requests" },
    { label: "Lessons", href: "/admin/lessons" },
    { label: "Lesson ops", href: "/admin/lesson-ops" },
    { label: "Payments", href: "/admin/payments" },
    { label: "Transcripts", href: "/admin/transcripts" },
    { label: "Reviews", href: "/support/transcripts" },
    { label: "Support team", href: "/admin/support" },
    { label: "Profile", href: "/profile" },
  ],
  super_admin: [
    { label: "Dashboard", href: "/super-admin/dashboard" },
    { label: "Students", href: "/admin/students" },
    { label: "Teachers", href: "/admin/teachers" },
    { label: "Assignments", href: "/admin/assignments" },
    { label: "Time changes", href: "/admin/change-requests" },
    { label: "Lessons", href: "/admin/lessons" },
    { label: "Lesson ops", href: "/admin/lesson-ops" },
    { label: "Payments", href: "/admin/payments" },
    { label: "Transcripts", href: "/admin/transcripts" },
    { label: "Reviews", href: "/support/transcripts" },
    { label: "Support team", href: "/admin/support" },
    { label: "Profile", href: "/profile" },
  ],
  support: [
    { label: "Review queue", href: "/support/transcripts" },
    { label: "Weekly digest", href: "/support/weekly" },
    { label: "Profile", href: "/profile" },
  ],
};
