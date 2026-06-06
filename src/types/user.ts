export type UserRole = "admin" | "teacher" | "student" | "parent";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}
