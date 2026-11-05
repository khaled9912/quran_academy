"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "@/services/notification.service";
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

const useNotificationsFeed = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    enabled: isAuthenticated,
    refetchInterval: LIVE_SYNC_INTERVAL,
  });
};

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

export const NotificationsBell = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const query = useNotificationsFeed();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const items = query.data?.items ?? [];
  const unread = query.data?.unread ?? 0;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!isAuthenticated) return null;

  const markRead = (id: string) => {
    void markNotificationRead(id).then(() =>
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
    );
  };

  const openItem = (item: AppNotification) => {
    if (!item.readAt) markRead(item.id);
    setOpen(false);
    if (item.link?.startsWith("/") && !item.link.startsWith("//")) {
      router.push(item.link);
    }
  };

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
        }
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[var(--toggle-bg)] text-[var(--toggle-icon)] shadow-sm transition hover:bg-white/10"
      >
        <Bell size={18} />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c2410c] px-1 text-[10px] font-bold leading-none text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-3 w-[min(92vw,380px)] overflow-hidden rounded-3xl border border-card-border bg-card-bg text-foreground shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-card-border px-5 py-4">
            <p className="flex items-center gap-2 text-lg font-semibold">
              Notifications
              {unread > 0 ? (
                <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
                  {unread}
                </span>
              ) : null}
            </p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={() =>
                  void markAllNotificationsRead().then(() =>
                    queryClient.invalidateQueries({
                      queryKey: NOTIFICATIONS_QUERY_KEY,
                    })
                  )
                }
                className="text-xs font-semibold text-green-600 dark:text-green-400 hover:underline"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {query.isLoading ? (
              <div className="space-y-2 p-4">
                {[0, 1, 2].map((row) => (
                  <div
                    key={row}
                    className="h-16 animate-pulse rounded-2xl bg-foreground/10"
                  />
                ))}
              </div>
            ) : query.isError ? (
              <p className="px-5 py-8 text-sm text-foreground opacity-70">
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
              <ul className="divide-y divide-card-border">
                {items.map((item) => {
                  const content = (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold">{item.title}</p>
                        <span className="shrink-0 text-xs text-foreground opacity-60">
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-foreground opacity-70">
                        {item.body}
                      </p>
                    </>
                  );
                  const className = `block px-5 py-4 text-left transition hover:bg-foreground/5 ${
                    item.readAt ? "" : "bg-green-50/70 dark:bg-green-500/5"
                  }`;
                  return (
                    <li key={item.id}>
                      {item.link ? (
                        <Link
                          href={item.link}
                          className={className}
                          onClick={(event) => {
                            event.preventDefault();
                            openItem(item);
                          }}
                        >
                          {content}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openItem(item)}
                          className={`w-full ${className}`}
                        >
                          {content}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-5 py-10 text-center text-sm text-foreground opacity-70">
                You&apos;re all caught up.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
