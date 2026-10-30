export interface TeacherStudentAssignment {
  id: string; teacherId: string; studentId: string; createdAt: string;
  status: "active" | "inactive"; teacherName?: string; studentName?: string;
}
