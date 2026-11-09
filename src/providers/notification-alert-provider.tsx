"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import {
  getNotifications,
  markNotificationRead,
  resolveNotificationHref,
} from "@/services/notification.service";
import { NOTIFICATIONS_QUERY_KEY } from "@/components/NotificationsBell";
import {
  playNotificationPing,
  primeNotificationSound,
} from "@/lib/notification-sounder";
import { showDesktopAlert } from "@/lib/notification-tray";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";

/**
 * Delivers an arrival chime and, when the tab is hidden, a system notification
 * for notifications the reader has not seen yet. The feed query is the only
 * trigger: the realtime socket invalidates it instantly and its own interval
 * covers a tab that was throttled or a socket that died.
 */
export function NotificationAlertProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, role } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const seen = useRef<Set<string> | null>(null);

  const feed = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: getNotifications,
    enabled: isAuthenticated,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });

  useEffect(() => {
    primeNotificationSound();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      seen.current = null;
      return;
    }
    const items = feed.data?.items;
    if (!items) return;
    // A feed loaded on arrival is history, not news.
    if (!seen.current) {
      seen.current = new Set(items.map((item) => item.id));
      return;
    }
    const known = seen.current;
    const arrivals = items.filter((item) => !known.has(item.id));
    if (!arrivals.length) return;
    for (const item of arrivals) known.add(item.id);
    playNotificationPing();
    for (const item of arrivals) void showDesktopAlert(item);
  }, [feed.data, isAuthenticated]);

  // A tray alert clicked from outside the tab: the worker tells this running
  // page where to go, so the reader lands inside their session and the alert
  // they just answered is cleared like any other.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== "academy-notification-click") return;
      const { link, id } = event.data;
      if (typeof id === "string") {
        void markNotificationRead(id)
          .then(() =>
            queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
          )
          .catch(() => {});
      }
      if (
        typeof link === "string" &&
        link.startsWith("/") &&
        !link.startsWith("//")
      ) {
        router.push(resolveNotificationHref(link, role));
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () =>
      navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [queryClient, router, role]);

  return <>{children}</>;
}
