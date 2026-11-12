import type {
  TranscriptCapture,
  TranscriptFlag,
  TranscriptSegment,
} from "./transcript";

export type ReviewStatus = "draft" | "submitted";

export type ReviewQueueFilter =
  | "all"
  | "unreviewed"
  | "draft"
  | "submitted"
  | "flagged";

export interface ReviewQueueItem {
  lessonId: string;
  startsAt: string;
  lessonStatus: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  segments: number;
  flaggedSegments: number;
  flagReasons: TranscriptFlag[];
  reviewStatus: ReviewStatus | null;
  reviewAverage: number | null;
  reviewerName: string | null;
  reviewUpdatedAt: string | null;
}

export interface ReviewMetrics {
  segments: number;
  teacherSegments: number;
  studentSegments: number;
  unknownSegments: number;
  teacherTalkPercent: number | null;
  studentTalkPercent: number | null;
  recordedSeconds: number | null;
  flaggedSegments: number;
  flagReasons: TranscriptFlag[];
}

export interface LessonQualityReview {
  id: string;
  lessonId: string;
  reviewerId: string;
  reviewerName: string;
  teachingClarity: number | null;
  studentPractice: number | null;
  correctionQuality: number | null;
  engagement: number | null;
  strengths: string | null;
  gaps: string | null;
  teacherAction: string | null;
  studentAction: string | null;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewWorkspace {
  captures: TranscriptCapture[];
  coverageReasons: TranscriptFlag[];
  lesson: {
    id: string;
    teacherId: string;
    studentId: string;
    startsAt: string;
    endsAt: string;
    status: string;
    teacherName: string;
    studentName: string;
  };
  metrics: ReviewMetrics;
  review: LessonQualityReview | null;
  segments: TranscriptSegment[];
}

export interface ReviewInput {
  teachingClarity: number | null;
  studentPractice: number | null;
  correctionQuality: number | null;
  engagement: number | null;
  strengths: string | null;
  gaps: string | null;
  teacherAction: string | null;
  studentAction: string | null;
  status: ReviewStatus;
}

export interface DigestAction {
  lessonId: string;
  startsAt: string;
  studentName: string;
  gaps: string | null;
  teacherAction: string | null;
  studentAction: string | null;
  reviewerName: string | null;
}

export interface DigestUnreviewedLesson {
  lessonId: string;
  startsAt: string;
  studentName: string;
  flaggedSegments: number;
  reviewStatus: ReviewStatus | null;
}

export interface TeacherDigest {
  teacherId: string;
  teacherName: string;
  lessons: number;
  reviewed: number;
  unreviewed: number;
  flaggedLessons: number;
  avgTeachingClarity: number | null;
  avgStudentPractice: number | null;
  avgCorrectionQuality: number | null;
  avgEngagement: number | null;
  actions: DigestAction[];
  unreviewedLessons: DigestUnreviewedLesson[];
}

export interface WeeklyDigest {
  weekStart: string;
  weekEnd: string;
  lessons: number;
  reviewed: number;
  flaggedLessons: number;
  teachers: TeacherDigest[];
}
