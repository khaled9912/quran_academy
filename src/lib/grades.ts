export interface GradeOption {
  value: string;
  short: string;
  label: string;
}

// Mirrors the API's StudentGrades list (ApiEndpoints.cs).
export const GRADE_OPTIONS: GradeOption[] = [
  {
    value: "Kindergarten",
    short: "Kindergarten",
    label: "Kindergarten — ages 5-6 (UK Year 1)",
  },
  { value: "Grade 1", short: "Grade 1", label: "Grade 1 — ages 6-7 (UK Year 2)" },
  { value: "Grade 2", short: "Grade 2", label: "Grade 2 — ages 7-8 (UK Year 3)" },
  { value: "Grade 3", short: "Grade 3", label: "Grade 3 — ages 8-9 (UK Year 4)" },
  { value: "Grade 4", short: "Grade 4", label: "Grade 4 — ages 9-10 (UK Year 5)" },
  { value: "Grade 5", short: "Grade 5", label: "Grade 5 — ages 10-11 (UK Year 6)" },
  { value: "Grade 6", short: "Grade 6", label: "Grade 6 — ages 11-12 (UK Year 7)" },
  { value: "Grade 7", short: "Grade 7", label: "Grade 7 — ages 12-13 (UK Year 8)" },
  { value: "Grade 8", short: "Grade 8", label: "Grade 8 — ages 13-14 (UK Year 9)" },
  { value: "Grade 9", short: "Grade 9", label: "Grade 9 — ages 14-15 (UK Year 10)" },
  {
    value: "Grade 10",
    short: "Grade 10",
    label: "Grade 10 — ages 15-16 (UK Year 11)",
  },
  {
    value: "Grade 11",
    short: "Grade 11",
    label: "Grade 11 — ages 16-17 (UK Year 12)",
  },
  {
    value: "Grade 12",
    short: "Grade 12",
    label: "Grade 12 — ages 17-18 (UK Year 13)",
  },
];
