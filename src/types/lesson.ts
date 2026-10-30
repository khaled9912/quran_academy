export type LessonStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";
export interface Lesson {
  id: string;
  teacherId: string;
  studentId: string;
  startsAt: string;
  endsAt: string;
  status: LessonStatus;
  actualStartedAt?: string | null;
  actualEndedAt?: string | null;
  teacherName?: string;
  studentName?: string;
}
