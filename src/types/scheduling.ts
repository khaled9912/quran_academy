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
  teacher: { id: string; fullName: string; email?: string };
  slots: AvailabilitySlot[];
}
