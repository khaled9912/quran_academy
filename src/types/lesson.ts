export type LessonStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export type LessonProgress = "excellent" | "good" | "needs_attention";

export interface LessonReport {
  id: string;
  lessonId: string;
  startsAt: string;
  endsAt: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  classSummary: string;
  studentFeedback: string;
  progress: LessonProgress;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherReview {
  id: string;
  lessonId: string;
  startsAt: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CancellationOutcome =
  | "free_cancellation"
  | "grace_cancellation"
  | "late_cancellation"
  | "cancelled_by_teacher"
  | "late_cancelled_by_teacher"
  | "admin_cancelled"
  | "student_no_show"
  | "teacher_no_show"
  | "both_absent"
  | "series_ended";

export interface Lesson {
  id: string;
  teacherId: string;
  studentId: string;
  startsAt: string;
  endsAt: string;
  status: LessonStatus;
  actualStartedAt?: string | null;
  actualEndedAt?: string | null;
  teacherName?: string;
  studentName?: string;
  report?: LessonReport | null;
  review?: TeacherReview | null;
  seriesId?: string | null;
  isTrial?: boolean;
  cancellationOutcome?: CancellationOutcome | string | null;
  cancelReason?: string | null;
  cancelledAt?: string | null;
  cancelledById?: string | null;
  isMakeup?: boolean;
  originalLessonId?: string | null;
}

export interface AcademyPolicy {
  studentFreeCancelHours: number;
  teacherFreeCancelHours: number;
  noShowGraceMinutes: number;
  rescheduleResponseHours: number;
  studentGraceCancellationsPerMonth: number;
  studentWarningStrikeThreshold: number;
  studentAdminReviewStrikeThreshold: number;
  teacherAdminReviewStrikeThreshold: number;
  trialNoShowThreshold: number;
  payScheduledDurationWhenAttended: boolean;
  updatedAt: string;
}

export type CreditEffect = "none" | "deduct" | "restore";

export interface CancellationPreview {
  allowed: boolean;
  blockedReason?: string | null;
  actorRole: string;
  outcome: string;
  isLate: boolean;
  usedGrace: boolean;
  graceUsedThisMonth: number;
  graceLimit: number;
  hoursBefore: number;
  scheduledMinutes: number;
  teacherPayableMinutes: number;
  creditChange: number;
  creditEffect: CreditEffect;
  reliabilityEvent?: string | null;
  requiresAdminReview: boolean;
  explanation: string;
  existingOutcome?: string | null;
  policy: AcademyPolicy;
}

export interface LessonCancellation {
  id: string;
  lessonId: string;
  actorRole: string;
  outcome: string;
  isLate: boolean;
  usedGrace: boolean;
  hoursBefore: number;
  teacherPayableMinutes: number;
  reason?: string | null;
  createdAt: string;
}

export type RescheduleStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "cancelled";

export interface RescheduleRequest {
  id: string;
  lessonId: string;
  requestedById: string;
  requestedByName: string;
  requestedByRole: string;
  proposedStartsAt: string;
  proposedEndsAt: string;
  note?: string | null;
  status: RescheduleStatus;
  expiresAt: string;
  respondedById?: string | null;
  respondedAt?: string | null;
  responseNote?: string | null;
  createdAt: string;
  minutesRemaining: number;
}

export interface AttendanceParticipant {
  userId: string;
  name: string;
  role: string;
  status: string;
  firstJoinedAt?: string | null;
  lastLeftAt?: string | null;
  totalSeconds: number;
  reconnectionCount: number;
  joinedLate: boolean;
  leftEarly: boolean;
}

export interface AttendanceInterval {
  id: string;
  deviceId: string;
  joinedAt: string;
  leftAt?: string | null;
  seconds: number;
}

export interface AttendanceSummary {
  lessonId: string;
  lessonStatus: string;
  startsAt: string;
  endsAt: string;
  serverNow: string;
  participants: AttendanceParticipant[];
}

export interface AttendanceBeatResult {
  accepted: boolean;
  participantStatus: string;
  totalSeconds: number;
  serverAt: string;
  summary: AttendanceSummary;
}

export interface ExcuseRequest {
  id: string;
  lessonId: string;
  studentId: string;
  studentName: string;
  startsAt: string;
  category: string;
  explanation: string;
  status: string;
  adminNote?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
}

export interface LessonIncident {
  id: string;
  lessonId: string;
  startsAt: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  type: string;
  status: string;
  detail: string;
  createdAt: string;
  resolvedAt?: string | null;
  resolutionNote?: string | null;
}

export interface TeacherHours {
  id: string;
  lessonId: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  startsAt: string;
  endsAt: string;
  lessonStatus: string;
  scheduledMinutes: number;
  actualAttendanceMinutes: number;
  proposedPayableMinutes: number;
  approvedPayableMinutes?: number | null;
  approvalStatus: string;
  adjustmentReason?: string | null;
  approvedAt?: string | null;
}

/** One in-app ring between the two participants, or from staff to one side. */
export interface LessonCall {
  id: string;
  lessonId: string;
  callerId: string;
  callerName: string;
  callerRole: string;
  calleeId: string;
  calleeName: string;
  calleeRole: string;
  /** room: a participant pressed it | monitor: staff pressed it */
  origin: string;
  /** not_joined | left | absent */
  calleeStatus: string;
  createdAt: string;
}

export interface LessonOperations {
  lessonId: string;
  cancellation: CancellationPreview;
  cancellationRecord?: LessonCancellation | null;
  pendingReschedule?: RescheduleRequest | null;
  rescheduleHistory: RescheduleRequest[];
  attendance: AttendanceSummary;
  hours?: TeacherHours | null;
  excuse?: ExcuseRequest | null;
  incident?: LessonIncident | null;
  replacementLesson?: Lesson | null;
  originalLesson?: Lesson | null;
  calls: LessonCall[];
}

export interface ReliabilityEvent {
  id: string;
  userId: string;
  userName: string;
  role: string;
  lessonId?: string | null;
  type: string;
  notes?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
  resolutionNote?: string | null;
  resolutionAction?: string | null;
}

export interface LessonCreditTransaction {
  id: string;
  studentId: string;
  lessonId?: string | null;
  type: string;
  amount: number;
  reason: string;
  createdByRole: string;
  createdAt: string;
}

export interface StudentCredit {
  studentId: string;
  balance: number;
  transactions: LessonCreditTransaction[];
}

export interface TeacherPenalty {
  id: string;
  teacherId: string;
  teacherName: string;
  lessonId?: string | null;
  eventType: string;
  amountEgp: number;
  reason: string;
  status: string;
  adminNote?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
}

export interface SalaryPeriod {
  id: string;
  teacherId: string;
  teacherName: string;
  month: string;
  status: string;
  totalScheduledMinutes: number;
  totalActualMinutes: number;
  totalProposedMinutes: number;
  totalApprovedMinutes: number;
  approvedPenaltyEgp: number;
  pendingPenaltyEgp: number;
  completedLessons: number;
  studentLateCancellations: number;
  teacherCancellations: number;
  teacherNoShows: number;
  studentNoShows: number;
  manualAdjustmentEgp: number;
  finalAmountEgp?: number | null;
  notes?: string | null;
  reviewedAt?: string | null;
  paidAt?: string | null;
}

export interface LessonOpsSummary {
  lessons: number;
  liveNow: number;
  upcoming: number;
  pendingReports: number;
  missingAttendance: number;
  pendingReschedules: number;
  pendingExcuses: number;
  noShowIncidents: number;
  pendingHours: number;
}

export interface AdminLessonOpsRow {
  lesson: Lesson;
  attendance: AttendanceSummary;
  cancellationOutcome?: string | null;
  pendingReschedule?: RescheduleRequest | null;
  hours?: TeacherHours | null;
  incidents: LessonIncident[];
  reportDue: boolean;
}

export interface AdminLessonOps {
  date: string;
  summary: LessonOpsSummary;
  lessons: AdminLessonOpsRow[];
}

export interface LessonScheduleChange {
  id: string;
  fromStartsAt: string;
  fromEndsAt: string;
  toStartsAt: string;
  toEndsAt: string;
  changedById?: string | null;
  reason?: string | null;
  createdAt: string;
}

export interface AdminLessonOpsDetail {
  lesson: Lesson;
  attendance: AttendanceSummary;
  intervals: AttendanceInterval[];
  cancellation?: LessonCancellation | null;
  rescheduleRequests: RescheduleRequest[];
  hours?: TeacherHours | null;
  incidents: LessonIncident[];
  excuse?: ExcuseRequest | null;
  credits: LessonCreditTransaction[];
  scheduleChanges: LessonScheduleChange[];
  calls: LessonCall[];
}
