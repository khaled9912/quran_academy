export interface Teacher {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  isActive?: boolean;
  deletedAt?: string | null;
  subject?: string;
  assignedCourseIds?: string[];
}
