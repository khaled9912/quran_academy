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

/** The label for where a notification takes the reader, or null if it goes nowhere. */
export const notificationCta = (link: string | null): string | null => {
  if (!link) return null;
  if (link.startsWith("/lesson/")) return "Open lesson";
  if (link.startsWith("/schedule")) return "Open schedule";
  return "Open";
};

/**
 * A notification row is written once and read by both clients, so its link uses
 * the mobile app's flat routes. The web app nests the same screens per role, so
 * those few paths are resolved against the reader's role before navigating.
 */
const webRoutes: Record<string, Record<string, string>> = {
  "/book": { student: "/student/availability" },
  "/requests": {
    teacher: "/teacher/schedule",
    admin: "/admin/change-requests",
    super_admin: "/admin/change-requests",
  },
  "/people": { admin: "/admin/payments", super_admin: "/admin/payments" },
  "/earnings": { teacher: "/teacher/payments" },
  "/payments": {
    student: "/student/payments",
    teacher: "/teacher/payments",
    admin: "/admin/payments",
    super_admin: "/admin/payments",
  },
};

export const resolveNotificationHref = (
  link: string,
  role: string | null | undefined
) => webRoutes[link]?.[role ?? ""] ?? link;

export const getNotifications = () =>
  backendFetch<NotificationsFeed>("/api/notifications");

export const markNotificationRead = (id: string) =>
  backendFetch<null>(`/api/notifications/${encodeURIComponent(id)}/read`, {
    method: "POST",
  });

export const markAllNotificationsRead = () =>
  backendFetch<null>("/api/notifications/read-all", { method: "POST" });
