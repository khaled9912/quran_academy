import { redirect } from "next/navigation";

// Attendance is not part of the scheduling API. Lessons already carry live
// status (scheduled/in_progress/completed), which the dashboard surfaces.
export default function TeacherAttendancePage() {
  redirect("/teacher/dashboard");
}
