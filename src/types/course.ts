export interface Course {
  id: string;
  title: string;
  description?: string;
  teacherId?: string;
  teacherName?: string;
  level?: string;
  status?: string;
  progress?: number;
  thumbnail?: string;
}
