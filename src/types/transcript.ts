export type TranscriptFlag = "phone" | "email" | "platform" | "offplatform";

export interface FlaggedLesson {
  lessonId: string;
  startsAt: string | null;
  status: string | null;
  teacherName: string | null;
  studentName: string | null;
  flaggedSegments: number;
  lastFlaggedAt: string;
  reasons: TranscriptFlag[];
}

export interface TranscriptSegment {
  id: string;
  speaker: string;
  text: string;
  atSeconds: number | null;
  createdAt: string;
  flags: TranscriptFlag[];
}

export interface LessonTranscript {
  lesson: {
    id: string;
    startsAt: string;
    endsAt: string;
    status: string;
    teacherName: string;
    studentName: string;
  };
  segments: TranscriptSegment[];
}
