export type TranscriptFlag =
  | "phone"
  | "email"
  | "platform"
  | "offplatform"
  | "payment"
  | "secrecy"
  | "no_transcript"
  | "unsupported_device";

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
  source: "client" | "server";
  text: string;
  atSeconds: number | null;
  createdAt: string;
  flags: TranscriptFlag[];
}

export interface TranscriptCapture {
  role: "teacher" | "student";
  lastStatus: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lastSegmentAt: string | null;
  segmentCount: number;
  expected: boolean;
}

export interface LessonTranscript {
  captures: TranscriptCapture[];
  coverageReasons: TranscriptFlag[];
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
