import { backendFetch } from "@/lib/backend-client";
import type { LessonReport } from "@/types/lesson";
import type { UserProfile } from "@/types/user";

interface ProfileResponse {
  user: UserProfile;
}

export const getProfile = () => backendFetch<ProfileResponse>("/api/profile");

export const getMyReports = () =>
  backendFetch<LessonReport[]>("/api/profile/reports");

export interface UpdateProfileInput {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

export const updateProfile = (input: UpdateProfileInput) =>
  backendFetch<ProfileResponse>("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });

export const uploadAvatar = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return backendFetch<{ avatarUrl: string }>("/api/profile/avatar", {
    method: "POST",
    body: form,
  });
};

export const deleteAvatar = () =>
  backendFetch<null>("/api/profile/avatar", { method: "DELETE" });
