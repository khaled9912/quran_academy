export type StudentLevel = "beginner" | "intermediate" | "advanced";

export type StudentWeeklyPreference = {
  id: string;
  dayOfWeek: number;
  startsAtTime: string;
  endsAtTime: string;
  timeZoneId: string;
};

export type StudentOnboarding = {
  studentId: string;
  quranLevel: string;
  tajweedLevel: string;
  islamicStudiesLevel: string;
  arabicLevel: string;
  timeZoneId: string;
  /** Days a week they asked for. Zero means they never chose. */
  planDaysPerWeek: number;
  weeklySlots: StudentWeeklyPreference[];
  completedAt: string | null;
  updatedAt: string;
};

/** A repeating weekly lesson the student already has, on their teacher's clock. */
export type StudentWeeklyLesson = {
  id: string;
  dayOfWeek: number;
  startsAtTime: string;
  endsAtTime: string;
  timeZoneId: string;
};

export type OnboardingDraft = {
  quranLevel: StudentLevel | "";
  tajweedLevel: StudentLevel | "";
  islamicStudiesLevel: StudentLevel | "";
  arabicLevel: StudentLevel | "";
  timeZoneId: string;
  /** Omitted as null until the student answers the plan question. */
  daysPerWeek: number | null;
  weeklySlots: { dayOfWeek: number; startsAtTime: string; endsAtTime: string }[];
  completed: boolean;
};

/** One student waiting for (or already given) a teacher, as the admin sees them. */
export type PendingStudent = {
  studentId: string;
  studentName: string;
  email: string;
  registeredAt: string;
  onboarding: StudentOnboarding | null;
  hasTeacher: boolean;
  teacherName: string | null;
  /** The repeating lessons this student already has — what still needs filling. */
  weeklyLessons: StudentWeeklyLesson[];
};
