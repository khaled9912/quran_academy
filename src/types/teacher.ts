export interface Teacher {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  isActive?: boolean;
  subject?: string;
  assignedCourseIds?: string[];
}
