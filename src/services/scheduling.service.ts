import { backendFetch } from "@/lib/backend-client";
import type {
  AvailabilitySlot,
  LessonRequest,
  TeacherAvailabilityResponse,
} from "@/types/scheduling";

// Student endpoints
export const getAssignedTeacherAvailability = () =>
  backendFetch<TeacherAvailabilityResponse>(
    "/api/student/teacher/availability"
  );
export const getMyLessonRequests = () =>
  backendFetch<LessonRequest[]>("/api/student/lesson-requests");
export const requestLessonSlot = (availabilitySlotId: string) =>
  backendFetch<LessonRequest>("/api/lesson-requests", {
    method: "POST",
    body: JSON.stringify({ availabilitySlotId }),
  });

// Teacher endpoints
export const getMyAvailability = () =>
  backendFetch<AvailabilitySlot[]>("/api/teacher/availability");
export const publishAvailability = (startsAt: string, endsAt: string) =>
  backendFetch<AvailabilitySlot>("/api/teacher/availability", {
    method: "POST",
    body: JSON.stringify({ startsAt, endsAt }),
  });
export const deleteAvailability = (slotId: string) =>
  backendFetch<null>(
    `/api/teacher/availability/${encodeURIComponent(slotId)}`,
    { method: "DELETE" }
  );
export const getIncomingLessonRequests = () =>
  backendFetch<LessonRequest[]>("/api/teacher/lesson-requests");
export const respondToLessonRequest = (
  requestId: string,
  decision: "confirm" | "reject"
) =>
  backendFetch<LessonRequest>(
    `/api/teacher/lesson-requests/${encodeURIComponent(requestId)}/${decision}`,
    { method: "POST" }
  );

// Admin availability on behalf of any teacher
export const getTeacherAvailabilityForAdmin = (teacherId: string) =>
  backendFetch<AvailabilitySlot[]>(
    `/api/admin/teachers/${encodeURIComponent(teacherId)}/availability`
  );
export const publishAvailabilityForTeacher = (
  teacherId: string,
  startsAt: string,
  endsAt: string
) =>
  backendFetch<AvailabilitySlot>(
    `/api/admin/teachers/${encodeURIComponent(teacherId)}/availability`,
    {
      method: "POST",
      body: JSON.stringify({ startsAt, endsAt }),
    }
  );
export const deleteTeacherAvailabilityAsAdmin = (
  teacherId: string,
  slotId: string
) =>
  backendFetch<null>(
    `/api/admin/teachers/${encodeURIComponent(teacherId)}/availability/${encodeURIComponent(slotId)}`,
    { method: "DELETE" }
  );

// Admin endpoints
export const getAdminLessonApprovals = () =>
  backendFetch<LessonRequest[]>(
    "/api/admin/lesson-requests?status=pending_admin"
  );
export const approveLessonRequest = (requestId: string) =>
  backendFetch<LessonRequest>(
    `/api/admin/lesson-requests/${encodeURIComponent(requestId)}/approve`,
    { method: "POST" }
  );
export const rejectLessonRequest = (requestId: string) =>
  backendFetch<LessonRequest>(
    `/api/admin/lesson-requests/${encodeURIComponent(requestId)}/reject`,
    { method: "POST" }
  );
