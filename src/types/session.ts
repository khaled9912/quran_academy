export interface Session {
  id: string;
  courseId?: string;
  courseTitle?: string;
  topicTitle?: string;
  scheduledAt?: string;
  meetLink?: string;
  teacherId?: string;
  studentIds?: string[];
}
