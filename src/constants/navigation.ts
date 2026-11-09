export interface NavLink {
  label: string;
  href: string;
  /** Desktop nav folds these into the "More" menu; mobile shows every link. */
  inMore?: boolean;
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
    { label: "Lesson ops", href: "/admin/lesson-ops", inMore: true },
    { label: "Payments", href: "/admin/payments", inMore: true },
    { label: "Transcripts", href: "/admin/transcripts", inMore: true },
    { label: "Reviews", href: "/support/transcripts", inMore: true },
    { label: "Support team", href: "/admin/support", inMore: true },
    { label: "Profile", href: "/profile", inMore: true },
  ],
  super_admin: [
    { label: "Dashboard", href: "/super-admin/dashboard" },
    { label: "Students", href: "/admin/students" },
    { label: "Teachers", href: "/admin/teachers" },
    { label: "Assignments", href: "/admin/assignments" },
    { label: "Time changes", href: "/admin/change-requests" },
    { label: "Lessons", href: "/admin/lessons" },
    { label: "Lesson ops", href: "/admin/lesson-ops", inMore: true },
    { label: "Payments", href: "/admin/payments", inMore: true },
    { label: "Transcripts", href: "/admin/transcripts", inMore: true },
    { label: "Reviews", href: "/support/transcripts", inMore: true },
    { label: "Support team", href: "/admin/support", inMore: true },
    { label: "Profile", href: "/profile", inMore: true },
  ],
  support: [
    { label: "Review queue", href: "/support/transcripts" },
    { label: "Weekly digest", href: "/support/weekly" },
    { label: "Profile", href: "/profile" },
  ],
};
