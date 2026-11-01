export const teacherSubjects = [
  { value: "quran", label: "Quran" },
  { value: "tajweed", label: "Tajweed" },
  { value: "islamic_studies", label: "Islamic studies" },
  { value: "arabic", label: "Arabic" },
] as const;

export type TeacherSubject = (typeof teacherSubjects)[number]["value"];

export const teacherSubjectLabel: Record<TeacherSubject, string> =
  Object.fromEntries(
    teacherSubjects.map((subject) => [subject.value, subject.label])
  ) as Record<TeacherSubject, string>;
