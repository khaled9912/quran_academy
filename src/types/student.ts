export interface Student {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  isActive?: boolean;
  deletedAt?: string | null;
  grade?: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  enrolledCourseIds?: string[];
}
