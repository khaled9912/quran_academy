import { backendFetch } from "@/lib/backend-client";
import type { Notification } from "@/types/notification";

export const getNotifications = async (): Promise<Notification[]> => {
  return backendFetch("/api/notifications");
};

export const markNotificationRead = async (id: string) => {
  return backendFetch(`/api/notifications/${id}/read`, {
    method: "PATCH",
  });
};
