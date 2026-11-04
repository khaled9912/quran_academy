import { backendFetch } from "@/lib/backend-client";

export type NotificationKind =
  | "booking"
  | "lesson"
  | "request"
  | "report"
  | "payment"
  | "system";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  kind: NotificationKind;
  link: string | null;
  createdAt: string;
  readAt: string | null;
};

export type NotificationsFeed = {
  items: AppNotification[];
  unread: number;
};

export const getNotifications = () =>
  backendFetch<NotificationsFeed>("/api/notifications");

export const markNotificationRead = (id: string) =>
  backendFetch<null>(`/api/notifications/${encodeURIComponent(id)}/read`, {
    method: "POST",
  });

export const markAllNotificationsRead = () =>
  backendFetch<null>("/api/notifications/read-all", { method: "POST" });
