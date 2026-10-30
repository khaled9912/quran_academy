export interface Student {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  isActive?: boolean;
  grade?: string;
  enrolledCourseIds?: string[];
}
