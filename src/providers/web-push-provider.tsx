"use client";

import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/providers/auth-provider";
import {
  dropWebPushSubscription,
  ensureWebPushSubscription,
} from "@/lib/web-push";

/**
 * Keeps this browser registered for pushes while an account is signed in, and
 * detached the moment it is not. Restoring the session is not waited for — the
 * registration is background work, and a first paint that stalls on it is worse
 * than a ring that arrives a second late.
 *
 * A clicked notification is not handled here: the worker posts the same
 * `academy-notification-click` message a tray alert uses, and
 * `NotificationAlertProvider` already turns that into a read marker and a
 * role-aware navigation.
 */
export function WebPushProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (isLoading) return;
    if (userId) void ensureWebPushSubscription(userId);
    else void dropWebPushSubscription();
  }, [userId, isLoading]);

  return <>{children}</>;
}
