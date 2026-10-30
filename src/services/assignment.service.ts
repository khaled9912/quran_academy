import { backendFetch } from "@/lib/backend-client";
import type { TeacherStudentAssignment } from "@/types/teacher-student-assignment";
export const getTeacherStudentAssignments = () =>
  backendFetch<TeacherStudentAssignment[]>("/api/teacher-student-assignments");
export const assignStudentToTeacher = (teacherId: string, studentId: string) =>
  backendFetch<TeacherStudentAssignment>("/api/teacher-student-assignments", {
    method: "POST",
    body: JSON.stringify({ teacherId, studentId }),
  });
export const removeTeacherStudentAssignment = (id: string) =>
  backendFetch<null>(
    `/api/teacher-student-assignments/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
