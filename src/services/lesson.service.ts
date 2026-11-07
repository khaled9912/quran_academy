import { backendFetch } from "@/lib/backend-client";
import type {
  LessonCall,
  AcademyPolicy,
  AdminLessonOps,
  AdminLessonOpsDetail,
  AttendanceBeatResult,
  CancellationPreview,
  ExcuseRequest,
  Lesson,
  LessonCreditTransaction,
  LessonIncident,
  LessonOperations,
  LessonProgress,
  LessonReport,
  ReliabilityEvent,
  RescheduleRequest,
  SalaryPeriod,
  TeacherHours,
  TeacherPenalty,
  TeacherReview,
} from "@/types/lesson";

const lessonPath = (id: string) => `/api/lessons/${encodeURIComponent(id)}`;

export const getLessons = (query = "") =>
  backendFetch<Lesson[]>(`/api/lessons${query ? `?${query}` : ""}`);
export const getLessonById = (id: string) =>
  backendFetch<Lesson>(lessonPath(id));
export const cancelLesson = (id: string, reason?: string) =>
  backendFetch<{ preview: CancellationPreview; lesson: Lesson }>(
    `${lessonPath(id)}/cancel`,
    {
      method: "POST",
      body: JSON.stringify({ reason: reason ?? "" }),
    }
  );

export const saveLessonReport = (
  id: string,
  input: {
    classSummary: string;
    studentFeedback: string;
    progress: LessonProgress;
  }
) =>
  backendFetch<LessonReport>(`${lessonPath(id)}/report`, {
    method: "POST",
    body: JSON.stringify(input),
  });

export const saveLessonReview = (
  id: string,
  input: { rating: number; comment?: string }
) =>
  backendFetch<TeacherReview>(`${lessonPath(id)}/review`, {
    method: "POST",
    body: JSON.stringify(input),
  });

// ---------------------------------------------------------------- operations

export const getLessonPolicy = () =>
  backendFetch<AcademyPolicy>("/api/lesson-policy");
export const updateLessonPolicy = (input: Partial<AcademyPolicy>) =>
  backendFetch<AcademyPolicy>("/api/lesson-policy", {
    method: "PUT",
    body: JSON.stringify(input),
  });

export const getLessonOperations = (id: string) =>
  backendFetch<LessonOperations>(`${lessonPath(id)}/operations`);
export const callLesson = (id: string, targetRole?: string) =>
  backendFetch<LessonCall>(`${lessonPath(id)}/call`, {
    method: "POST",
    body: JSON.stringify({ targetRole: targetRole ?? "" }),
  });

/** Rings still worth acting on for the signed-in user. */
export const getRecentCalls = () =>
  backendFetch<LessonCall[]>("/api/calls/recent");

export const createRescheduleRequest = (
  id: string,
  input: { startsAt: string; endsAt: string; note?: string }
) =>
  backendFetch<RescheduleRequest>(`${lessonPath(id)}/reschedule-requests`, {
    method: "POST",
    body: JSON.stringify(input),
  });
export const respondToRescheduleRequest = (
  requestId: string,
  action: "accept" | "decline",
  note?: string
) =>
  backendFetch<RescheduleRequest>(
    `/api/reschedule-requests/${encodeURIComponent(requestId)}/${action}`,
    { method: "POST", body: JSON.stringify({ note: note ?? "" }) }
  );
export const cancelRescheduleRequest = (requestId: string) =>
  backendFetch<null>(
    `/api/reschedule-requests/${encodeURIComponent(requestId)}/cancel`,
    {
      method: "POST",
    }
  );

export const sendAttendanceEvent = (
  id: string,
  input: {
    action: "join" | "leave";
    deviceId: string;
    eventId: string;
    clientAt?: string;
  },
  options: { keepalive?: boolean } = {}
) =>
  backendFetch<AttendanceBeatResult>(`${lessonPath(id)}/attendance/events`, {
    method: "POST",
    body: JSON.stringify(input),
    // A beacon during unload must not be aborted by the page going away.
    keepalive: options.keepalive,
  });

export const requestExcuse = (
  id: string,
  input: { category: string; explanation: string }
) =>
  backendFetch<ExcuseRequest>(`${lessonPath(id)}/excuse`, {
    method: "POST",
    body: JSON.stringify(input),
  });

export const reportLessonIncident = (
  id: string,
  input: { type: string; detail: string }
) =>
  backendFetch<LessonIncident>(`${lessonPath(id)}/incident`, {
    method: "POST",
    body: JSON.stringify(input),
  });

// ------------------------------------------------------------------- admin

const adminQuery = (params: Record<string, string | undefined>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const text = search.toString();
  return text ? `?${text}` : "";
};

export const getAdminLessonOps = (date?: string) =>
  backendFetch<AdminLessonOps>(`/api/admin/lesson-ops${adminQuery({ date })}`);
export const getAdminLessonOpsDetail = (lessonId: string) =>
  backendFetch<AdminLessonOpsDetail>(
    `/api/admin/lesson-ops/${encodeURIComponent(lessonId)}`
  );

export const getExcuseRequests = (status = "pending") =>
  backendFetch<ExcuseRequest[]>(
    `/api/admin/excuse-requests${adminQuery({ status })}`
  );
export const approveExcuseRequest = (id: string, note?: string) =>
  backendFetch<ExcuseRequest>(
    `/api/admin/excuse-requests/${encodeURIComponent(id)}/approve`,
    { method: "POST", body: JSON.stringify({ note: note ?? "" }) }
  );
export const rejectExcuseRequest = (id: string, note?: string) =>
  backendFetch<ExcuseRequest>(
    `/api/admin/excuse-requests/${encodeURIComponent(id)}/reject`,
    { method: "POST", body: JSON.stringify({ note: note ?? "" }) }
  );

export const getLessonIncidents = (status = "open") =>
  backendFetch<LessonIncident[]>(
    `/api/admin/lesson-incidents${adminQuery({ status })}`
  );
export const resolveLessonIncident = (
  id: string,
  input: {
    action: "student_no_show" | "teacher_no_show" | "both_absent" | "dismissed";
    note?: string;
    teacherPayableMinutes?: number;
  }
) =>
  backendFetch<LessonIncident>(
    `/api/admin/lesson-incidents/${encodeURIComponent(id)}/resolve`,
    { method: "POST", body: JSON.stringify(input) }
  );

export const getAdminTeacherHours = (query = "") =>
  backendFetch<TeacherHours[]>(`/api/admin/teacher-hours${query}`);
export const approveTeacherHours = (
  id: string,
  input: { approvedMinutes?: number; note?: string }
) =>
  backendFetch<TeacherHours>(
    `/api/admin/teacher-hours/${encodeURIComponent(id)}/approve`,
    { method: "POST", body: JSON.stringify(input) }
  );
export const rejectTeacherHours = (id: string, note?: string) =>
  backendFetch<TeacherHours>(
    `/api/admin/teacher-hours/${encodeURIComponent(id)}/reject`,
    { method: "POST", body: JSON.stringify({ note: note ?? "" }) }
  );

export const getTeacherPenalties = (status?: string) =>
  backendFetch<TeacherPenalty[]>(
    `/api/admin/teacher-penalties${adminQuery({ status })}`
  );
export const createTeacherPenalty = (input: {
  teacherId: string;
  lessonId?: string;
  eventType?: string;
  amountEgp: number;
  reason: string;
}) =>
  backendFetch<TeacherPenalty>("/api/admin/teacher-penalties", {
    method: "POST",
    body: JSON.stringify(input),
  });
export const reviewTeacherPenalty = (
  id: string,
  input: { status: "approved" | "rejected" | "voided"; note?: string }
) =>
  backendFetch<TeacherPenalty>(
    `/api/admin/teacher-penalties/${encodeURIComponent(id)}/review`,
    { method: "POST", body: JSON.stringify(input) }
  );

export const getReliabilityEvents = (query = "") =>
  backendFetch<ReliabilityEvent[]>(`/api/admin/reliability${query}`);
export const resolveReliabilityEvent = (
  id: string,
  input: { note?: string; action?: string }
) =>
  backendFetch<ReliabilityEvent>(
    `/api/admin/reliability/${encodeURIComponent(id)}/resolve`,
    { method: "POST", body: JSON.stringify(input) }
  );

export const adjustStudentCredits = (
  studentId: string,
  input: { amount: number; reason: string }
) =>
  backendFetch<LessonCreditTransaction>(
    `/api/admin/students/${encodeURIComponent(studentId)}/credits/adjust`,
    { method: "POST", body: JSON.stringify(input) }
  );

export const getSalaryPeriods = (month?: string) =>
  backendFetch<SalaryPeriod[]>(
    `/api/admin/salary-periods${adminQuery({ month })}`
  );
export const generateSalaryPeriods = (month?: string) =>
  backendFetch<SalaryPeriod[]>("/api/admin/salary-periods/generate", {
    method: "POST",
    body: JSON.stringify({ month }),
  });
export const updateSalaryPeriod = (
  id: string,
  input: {
    manualAdjustmentEgp?: number;
    finalAmountEgp?: number;
    notes?: string;
    status?: "open" | "reviewed" | "paid";
  }
) =>
  backendFetch<SalaryPeriod>(
    `/api/admin/salary-periods/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(input) }
  );
