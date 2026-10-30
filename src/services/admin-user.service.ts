import { backendFetch } from "@/lib/backend-client";

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
}

export const updateManagedUser = (id: string, input: AdminUserUpdate) =>
  backendFetch<AdminManagedUser>(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

export const deactivateManagedUser = (id: string) =>
  backendFetch<null>(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
