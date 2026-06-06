export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject?: string;
  assignedCourseIds?: string[];
}
