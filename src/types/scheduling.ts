import type { Lesson, TeacherReview } from "./lesson";
import type { UserProfile } from "./user";

export type WeeklyRuleStatus = "available" | "booked" | "yours";

export interface WeeklyRule {
  id: string;
  teacherId: string;
  dayOfWeek: number;
  startsAtTime: string;
  endsAtTime: string;
  timeZoneId: string;
  status: WeeklyRuleStatus;
}

export interface WeeklyTeacher {
  teacher: UserProfile;
  slots: WeeklyRule[];
  averageRating?: number | null;
  reviewCount: number;
}

export interface LessonSeries {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  dayOfWeek: number;
  startsAtTime: string;
  endsAtTime: string;
  timeZoneId: string;
  isActive: boolean;
  createdAt: string;
}

export type ChangeRequestStatus = "pending" | "approved" | "rejected";

export interface LessonChangeRequest {
  id: string;
  seriesId: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  currentDayOfWeek: number;
  currentStartsAtTime: string;
  currentEndsAtTime: string;
  requestedDayOfWeek: number;
  requestedStartsAtTime: string;
  requestedEndsAtTime: string;
  timeZoneId: string;
  status: ChangeRequestStatus;
  studentNote?: string | null;
  adminNote?: string | null;
  createdAt: string;
  adminRespondedAt?: string | null;
}

export interface WeeklyAvailability {
  teacher: UserProfile | null;
  slots: WeeklyRule[];
  series: LessonSeries[];
  averageRating?: number | null;
  reviewCount: number;
  reviews?: TeacherReview[] | null;
  hasLessons: boolean;
}

export interface BookWeeklySlotsResult {
  series: LessonSeries[];
  lessons: Lesson[];
}

export interface PublicTeacher {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  averageRating?: number | null;
  reviewCount: number;
  reviews: TeacherReview[];
}
