import { backendFetch } from "@/lib/backend-client";
import type { BookWeeklySlotsResult } from "@/types/scheduling";
import type { OnboardingDraft, PendingStudent, StudentOnboarding } from "@/types/onboarding";

export const getMyOnboarding = () =>
  backendFetch<StudentOnboarding | null>("/api/student/onboarding");

export const saveMyOnboarding = (draft: OnboardingDraft) =>
  backendFetch<StudentOnboarding | null>("/api/student/onboarding", {
    method: "PUT",
    body: JSON.stringify(draft),
  });

/**
 * The plan a student wants, recorded from /plans. It is what the month's bill is
 * priced from, and the assignment desk reads it next to their weekly hours — but
 * nothing is charged until a month has ended with classes in it.
 */
export const choosePlanForStudent = (daysPerWeek: number) =>
  backendFetch<StudentOnboarding>("/api/student/plan", {
    method: "PATCH",
    body: JSON.stringify({ daysPerWeek }),
  });

/** Everyone waiting on a teacher, with the answers their assignment is made from. */
export const getPendingStudents = () =>
  backendFetch<PendingStudent[]>("/api/admin/students/pending");

/** The academy books the student's repeating weekly lesson. */
export const bookWeeklyLessonsForStudent = (studentId: string, ruleIds: string[]) =>
  backendFetch<BookWeeklySlotsResult>(
    `/api/admin/students/${encodeURIComponent(studentId)}/weekly-lessons`,
    { method: "POST", body: JSON.stringify({ ruleIds }) }
  );
