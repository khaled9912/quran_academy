export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  dueDate?: string;
  status?: "draft" | "published" | "submitted" | "graded";
}
