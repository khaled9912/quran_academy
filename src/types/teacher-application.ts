import type { TeacherSubject } from "@/lib/teacher-subjects";

export type TeacherApplicationStatus = "pending" | "approved" | "rejected";

export const englishLevels = [
  "beginner",
  "intermediate",
  "advanced",
  "fluent",
] as const;

export type EnglishLevel = (typeof englishLevels)[number];

export const englishLevelLabel: Record<EnglishLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  fluent: "Fluent",
};

export interface TeacherApplication {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  subjects: TeacherSubject[];
  englishLevel: EnglishLevel;
  experienceYears: number;
  bio: string;
  availabilityNote: string;
  status: TeacherApplicationStatus;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  teacherId: string | null;
  cvFileName: string | null;
  introFileName: string | null;
}

export interface SubmitTeacherApplicationInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  subjects: TeacherSubject[];
  englishLevel: EnglishLevel;
  experienceYears: number;
  bio: string;
  availabilityNote: string;
  cv: File;
  intro: File;
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
