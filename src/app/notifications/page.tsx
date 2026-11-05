"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notification.service";
import { useAuth } from "@/providers/auth-provider";
import { LIVE_SYNC_INTERVAL } from "@/lib/query-client";

const timeAgo = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return "Just now";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const NotificationsPage = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    enabled: isAuthenticated,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });

  const items = query.data?.items ?? [];
  const unread = query.data?.unread ?? 0;

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["notifications"] });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 text-foreground">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <h1 className="mb-2 text-4xl font-bold">Notifications</h1>
          <p className="text-lg text-foreground opacity-75">
            <Link
              href="/login"
              className="font-semibold text-green-600 dark:text-green-400"
            >
              Sign in
            </Link>{" "}
            to see booking confirmations and lesson reminders.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 text-foreground">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-4xl font-bold">Notifications</h1>
            <p className="text-lg text-foreground opacity-75">
              Bookings, lesson reminders, reports, and payment updates.
            </p>
          </div>
          {unread > 0 ? (
            <button
              type="button"
              onClick={() =>
                void markAllNotificationsRead().then(() => void refresh())
              }
              className="rounded-xl border border-card-border bg-card-bg px-4 py-2 text-sm font-semibold hover:border-green-500"
            >
              Mark all read
            </button>
          ) : null}
        </div>

        {query.isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="h-20 animate-pulse rounded-3xl bg-foreground/10"
              />
            ))}
          </div>
        ) : query.isError ? (
          <p className="rounded-2xl border border-card-border p-6 text-foreground opacity-70">
            Notifications could not load.{" "}
            <button
              type="button"
              onClick={() => void query.refetch()}
              className="font-semibold text-green-600 dark:text-green-400 hover:underline"
            >
              Try again
            </button>
          </p>
        ) : items.length ? (
          <ul className="space-y-3">
            {items.map((item) => {
              const body = (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">{item.title}</p>
                    <p className="mt-1 text-foreground opacity-70">
                      {item.body}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm text-foreground opacity-60">
                    {timeAgo(item.createdAt)}
                  </span>
                </div>
              );
              const className = `block rounded-3xl border p-6 transition hover:border-green-400 ${
                item.readAt
                  ? "border-card-border bg-card-bg"
                  : "border-green-300 dark:border-green-500/30 bg-green-50/70 dark:bg-green-500/5"
              }`;
              return (
                <li key={item.id}>
                  {item.link ? (
                    <Link
                      href={item.link}
                      className={className}
                      onClick={() => {
                        if (!item.readAt)
                          void markNotificationRead(item.id).then(
                            () => void refresh()
                          );
                      }}
                    >
                      {body}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!item.readAt)
                          void markNotificationRead(item.id).then(
                            () => void refresh()
                          );
                      }}
                      className={`w-full text-left ${className}`}
                    >
                      {body}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-3xl border border-dashed border-card-border p-10 text-center text-foreground opacity-70">
            You&apos;re all caught up.
          </p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
