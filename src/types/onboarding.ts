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
  weeklySlots: StudentWeeklyPreference[];
  completedAt: string | null;
  updatedAt: string;
};

export type OnboardingDraft = {
  quranLevel: StudentLevel | "";
  tajweedLevel: StudentLevel | "";
  islamicStudiesLevel: StudentLevel | "";
  arabicLevel: StudentLevel | "";
  timeZoneId: string;
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
};
