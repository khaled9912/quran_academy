import type { TeacherReview } from "./lesson";

export type AvailabilitySlotStatus =
  | "available"
  | "requested"
  | "booked"
  | "unavailable";
export type LessonRequestStatus =
  | "pending_teacher"
  | "pending_student"
  | "pending_admin"
  | "approved"
  | "rejected"
  | "cancelled"
  | "expired";

export interface AvailabilitySlot {
  id: string;
  teacherId: string;
  startsAt: string;
  endsAt: string;
  status: AvailabilitySlotStatus;
}

export interface LessonRequest {
  id: string;
  teacherId: string;
  studentId: string;
  availabilitySlotId?: string | null;
  startsAt: string;
  endsAt: string;
  status: LessonRequestStatus;
  studentName?: string;
  teacherName?: string;
  createdAt: string;
}

export interface TeacherAvailabilityResponse {
  teacher: {
    id: string;
    fullName: string;
    email?: string;
    phoneNumber?: string | null;
    avatarUrl?: string | null;
  };
  slots: AvailabilitySlot[];
  averageRating?: number | null;
  reviewCount?: number;
  reviews?: TeacherReview[] | null;
}

export interface PublicTeacher {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  averageRating?: number | null;
  reviewCount: number;
  reviews: TeacherReview[];
}
