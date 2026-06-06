export type UserRole = "super_admin" | "admin" | "teacher" | "student";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  is_active?: boolean;
  avatar_url?: string;
  created_at?: string;
}
