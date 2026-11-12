import { backendFetch } from "@/lib/backend-client";
import type {
  ChangeRequestStatus,
  LessonChangeRequest,
  LessonSeries,
  PublicTeacher,
  WeeklyAvailability,
  WeeklyRule,
} from "@/types/scheduling";

// Public endpoints
export const getPublicTeachers = () =>
  backendFetch<PublicTeacher[]>("/api/teachers/public");
export const getPublicTeacher = (teacherId: string) =>
  backendFetch<PublicTeacher>(
    `/api/teachers/public/${encodeURIComponent(teacherId)}`
  );

// Student-facing weekly availability
/** The weekly times of the teacher assigned to this student. */
export const getTeacherWeeklyAvailability = (teacherId: string) =>
  backendFetch<WeeklyAvailability>(
    `/api/teachers/${encodeURIComponent(teacherId)}/weekly-availability`
  );
export const getAssignedWeeklyAvailability = () =>
  backendFetch<WeeklyAvailability>("/api/student/teacher/weekly-availability");
export const getMySeries = () =>
  backendFetch<LessonSeries[]>("/api/student/series");
export const endWeeklySeries = (seriesId: string) =>
  backendFetch<null>(`/api/student/series/${encodeURIComponent(seriesId)}`, {
    method: "DELETE",
  });
export const getMyChangeRequests = () =>
  backendFetch<LessonChangeRequest[]>("/api/student/change-requests");
export const requestTimeChange = (
  seriesId: string,
  requestedRuleId: string,
  note?: string
) =>
  backendFetch<LessonChangeRequest>(
    `/api/student/series/${encodeURIComponent(seriesId)}/change-requests`,
    {
      method: "POST",
      body: JSON.stringify(
        note?.trim()
          ? { requestedRuleId, note: note.trim() }
          : { requestedRuleId }
      ),
    }
  );

// Teacher weekly availability
export const getMyAvailabilityRules = () =>
  backendFetch<WeeklyRule[]>("/api/teacher/availability-rules");
export const publishWeeklyAvailability = (input: {
  daysOfWeek: number[];
  startsAtTime: string;
  endsAtTime: string;
  timeZoneId: string;
}) =>
  backendFetch<WeeklyRule[]>("/api/teacher/availability-rules", {
    method: "POST",
    body: JSON.stringify(input),
  });
export const deleteWeeklyAvailability = (ruleId: string) =>
  backendFetch<null>(
    `/api/teacher/availability-rules/${encodeURIComponent(ruleId)}`,
    { method: "DELETE" }
  );

// Read-only history of weekly times students moved themselves
export const getAdminChangeRequests = (status?: ChangeRequestStatus) =>
  backendFetch<LessonChangeRequest[]>(
    `/api/admin/change-requests${status ? `?status=${status}` : ""}`
  );

// Admin weekly availability on behalf of a teacher
export const getTeacherWeeklyAvailabilityForAdmin = (teacherId: string) =>
  backendFetch<WeeklyRule[]>(
    `/api/admin/teachers/${encodeURIComponent(teacherId)}/availability-rules`
  );
export const publishWeeklyAvailabilityForTeacher = (
  teacherId: string,
  input: {
    daysOfWeek: number[];
    startsAtTime: string;
    endsAtTime: string;
    timeZoneId: string;
  }
) =>
  backendFetch<WeeklyRule[]>(
    `/api/admin/teachers/${encodeURIComponent(teacherId)}/availability-rules`,
    { method: "POST", body: JSON.stringify(input) }
  );
export const deleteTeacherWeeklyAvailabilityAsAdmin = (
  teacherId: string,
  ruleId: string
) =>
  backendFetch<null>(
    `/api/admin/teachers/${encodeURIComponent(teacherId)}/availability-rules/${encodeURIComponent(ruleId)}`,
    { method: "DELETE" }
  );
/** Ends every student's repeating series on this weekly time so it can be removed. */
export const releaseTeacherWeeklyAvailabilityAsAdmin = (
  teacherId: string,
  ruleId: string
) =>
  backendFetch<{ released: number; lessonsCancelled: number }>(
    `/api/admin/teachers/${encodeURIComponent(teacherId)}/availability-rules/${encodeURIComponent(ruleId)}/release`,
    { method: "POST" }
  );
