export interface Teacher {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  isActive?: boolean;
  subject?: string;
  assignedCourseIds?: string[];
}
