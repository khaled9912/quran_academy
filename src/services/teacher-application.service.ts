import { backendBlobFetch, backendFetch } from "@/lib/backend-client";
import type {
  ReviewTeacherApplicationInput,
  ReviewTeacherApplicationResult,
  SubmitTeacherApplicationInput,
  TeacherApplication,
  TeacherApplicationStatus,
} from "@/types/teacher-application";

export const submitTeacherApplication = (
  input: SubmitTeacherApplicationInput
) => {
  const form = new FormData();
  form.append("fullName", input.fullName);
  form.append("email", input.email);
  form.append("phoneNumber", input.phoneNumber);
  input.subjects.forEach((subject) => form.append("subjects", subject));
  form.append("englishLevel", input.englishLevel);
  form.append("experienceYears", String(input.experienceYears));
  form.append("bio", input.bio);
  form.append("availabilityNote", input.availabilityNote);
  form.append("cv", input.cv, input.cv.name);
  if (input.intro) form.append("intro", input.intro, input.intro.name);
  form.append("quran", input.quran, input.quran.name);
  return backendFetch<{ id: string; status: string }>(
    "/api/teacher-applications",
    { method: "POST", body: form }
  );
};

export const getTeacherApplications = (
  status?: TeacherApplicationStatus | "all"
) =>
  backendFetch<TeacherApplication[]>(
    `/api/admin/teacher-applications${
      status && status !== "all" ? `?status=${status}` : ""
    }`
  );

export const reviewTeacherApplication = (
  id: string,
  input: ReviewTeacherApplicationInput
) =>
  backendFetch<ReviewTeacherApplicationResult>(
    `/api/admin/teacher-applications/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(input) }
  );

export const downloadTeacherApplicationCv = (id: string) =>
  backendBlobFetch(
    `/api/admin/teacher-applications/${encodeURIComponent(id)}/cv`
  );

export const downloadTeacherApplicationIntro = (id: string) =>
  backendBlobFetch(
    `/api/admin/teacher-applications/${encodeURIComponent(id)}/intro`
  );

export const downloadTeacherApplicationQuran = (id: string) =>
  backendBlobFetch(
    `/api/admin/teacher-applications/${encodeURIComponent(id)}/quran`
  );
