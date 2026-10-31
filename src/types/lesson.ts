export type LessonStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export type LessonProgress = "excellent" | "good" | "needs_attention";

export interface LessonReport {
  id: string;
  lessonId: string;
  startsAt: string;
  endsAt: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  classSummary: string;
  studentFeedback: string;
  progress: LessonProgress;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherReview {
  id: string;
  lessonId: string;
  startsAt: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
}

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
  report?: LessonReport | null;
  review?: TeacherReview | null;
}
