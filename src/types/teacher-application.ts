import type { TeacherSubject } from "@/lib/teacher-subjects";

export type TeacherApplicationStatus = "pending" | "approved" | "rejected";

export interface TeacherApplication {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  subjects: TeacherSubject[];
  experienceYears: number;
  bio: string;
  availabilityNote: string;
  status: TeacherApplicationStatus;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  teacherId: string | null;
  cvFileName: string | null;
}

export interface SubmitTeacherApplicationInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  subjects: TeacherSubject[];
  experienceYears: number;
  bio: string;
  availabilityNote: string;
  cv: File;
}

export interface ReviewTeacherApplicationInput {
  status: "approved" | "rejected";
  reason?: string;
}

export interface ReviewTeacherApplicationResult {
  application: TeacherApplication;
  inviteEmailed: boolean;
  inviteCode: string | null;
}
