import { backendFetch } from "@/lib/backend-client";
import type { CreateTeacherInput } from "@/services/teacher.service";

export interface AdminUserUpdate {
  fullName?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
}

export interface AdminManagedUser {
  id: string;
  fullName?: string;
  name?: string;
  email: string;
  role?: string;
  isActive?: boolean;
  deletedAt?: string | null;
}

export const updateManagedUser = (id: string, input: AdminUserUpdate) =>
  backendFetch<AdminManagedUser>(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

// Deactivation is a pause: sign-in stops, bookings stay. Delete releases them.
export const deactivateManagedUser = (id: string) =>
  updateManagedUser(id, { isActive: false });

export const deleteManagedUser = (id: string) =>
  backendFetch<null>(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

export const getSupportUsers = () =>
  backendFetch<AdminManagedUser[]>("/api/admin/support-users");

export const createSupportUser = async (input: CreateTeacherInput) => {
  const { user } = await backendFetch<{ user: AdminManagedUser }>(
    "/api/admin/users",
    {
      method: "POST",
      body: JSON.stringify({ ...input, role: "support" }),
    }
  );
  return user;
};
