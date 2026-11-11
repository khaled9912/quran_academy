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
  /** When this recurring time happens next, or null if the teacher is away. */
  nextStartsAt?: string | null;
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

/** `pending`/`approved`/`rejected` only appear on rows the old approval queue left behind. */
export type ChangeRequestStatus =
  | "applied"
  | "pending"
  | "approved"
  | "rejected";

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
  /** Academy-wide notice a weekly-time move must leave the teacher, in minutes. */
  timeChangeLeadMinutes?: number;
}

export interface BookWeeklySlotsResult {
  series: LessonSeries[];
  lessons: Lesson[];
}

export type OpenOfferStatus = "open" | "claimed" | "withdrawn";

/** A one-off time an unassigned student offers to every active teacher. */
export interface OpenStudentOffer {
  id: string;
  studentId: string;
  studentName: string;
  startsAt: string;
  endsAt: string;
  status: OpenOfferStatus;
  claimedByTeacherId?: string | null;
  claimedByTeacherName?: string | null;
  lessonId?: string | null;
  createdAt: string;
  claimedAt?: string | null;
}

export interface PublicTeacher {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  averageRating?: number | null;
  reviewCount: number;
  reviews: TeacherReview[];
}
