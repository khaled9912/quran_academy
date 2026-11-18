"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  Trash2,
  WifiOff,
  X,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { dispatchToast } from "@/lib/toast";
import {
  clearOfflineData,
  isIosDevice,
  isStandalone,
  registerAppWorker,
  type InstallPromptEvent,
} from "@/lib/pwa";
import type { OutboxItem } from "@/lib/offline/outbox";

const INSTALL_DISMISS_KEY = "aq-install-dismissed";

/**
 * The installed-app layer: registers the worker after first paint, shows the
 * connectivity/sync banner, and offers the install prompt. Everything here is
 * an enhancement — nothing blocks or delays the page itself, and the outbox
 * modules load lazily so browsers that never go offline never fetch them.
 */
export function PwaProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [online, setOnline] = useState(true);
  const [items, setItems] = useState<OutboxItem[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [installEvent, setInstallEvent] =
    useState<InstallPromptEvent | null>(null);
  const [installDismissed, setInstallDismissed] = useState(true);
  const [showIosHint, setShowIosHint] = useState(false);
  const previousUser = useRef(user);

  const refreshItems = useCallback(async () => {
    const { getOutboxItems } = await import("@/lib/offline/outbox");
    setItems(await getOutboxItems());
  }, []);

  const syncNow = useCallback(async () => {
    const { syncOutbox } = await import("@/lib/offline/sync");
    void syncOutbox();
  }, []);

  // Connectivity state.
  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Worker registration + sync engine, deferred until the page is idle so
  // first paint and hydration never pay for them.
  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      const registration = await registerAppWorker();
      if (cancelled || !registration) return;
      const { startOutboxSync } = await import("@/lib/offline/sync");
      startOutboxSync();
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          // A controller means this is an update, not the first install.
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            dispatchToast(
              "A new version of Ana Quran is ready — it applies as you browse.",
              "info"
            );
          }
        });
      });
    };
    const schedule = () => {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(() => void start(), { timeout: 4000 });
      } else {
        window.setTimeout(() => void start(), 2500);
      }
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
    };
  }, []);

  // Outbox contents for the banner, kept current without polling.
  useEffect(() => {
    void refreshItems();
    const onChanged = () => void refreshItems();
    const onSynced = () => {
      void refreshItems();
      void queryClient.invalidateQueries();
    };
    window.addEventListener("academy:outbox-changed", onChanged);
    window.addEventListener("academy:outbox-synced", onSynced);
    return () => {
      window.removeEventListener("academy:outbox-changed", onChanged);
      window.removeEventListener("academy:outbox-synced", onSynced);
    };
  }, [refreshItems, queryClient]);

  // The cached pages and answers belong to one reader: wipe them when the
  // session ends so the next sign-in on this device starts clean.
  useEffect(() => {
    if (previousUser.current && !user) void clearOfflineData();
    previousUser.current = user;
  }, [user]);
  useEffect(() => {
    const onUnauthorized = () => {
      // Anonymous visitors get a 401 from the session probe on every load;
      // that must not wipe the offline cache. Only a real session ending does.
      if (previousUser.current) void clearOfflineData();
    };
    window.addEventListener("academy:unauthorized", onUnauthorized);
    return () =>
      window.removeEventListener("academy:unauthorized", onUnauthorized);
  }, []);

  // Install offer: Chrome's prompt where available, manual instructions on
  // iOS, and never again once dismissed or installed.
  useEffect(() => {
    setInstallDismissed(localStorage.getItem(INSTALL_DISMISS_KEY) === "1");
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstallEvent(null);
      setShowIosHint(false);
      dispatchToast("Ana Quran is installed.", "success");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if (isIosDevice() && !isStandalone()) setShowIosHint(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismissInstall = () => {
    localStorage.setItem(INSTALL_DISMISS_KEY, "1");
    setInstallDismissed(true);
    setInstallEvent(null);
    setShowIosHint(false);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstallEvent(null);
  };

  const retryItem = async (id: string) => {
    const { retryOutboxItem } = await import("@/lib/offline/outbox");
    await retryOutboxItem(id);
    await syncNow();
  };

  const discardItem = async (id: string) => {
    const { discardOutboxItem } = await import("@/lib/offline/outbox");
    await discardOutboxItem(id);
  };

  const pendingCount = items.filter((item) => item.status === "pending").length;
  const failedCount = items.length - pendingCount;
  const showBanner = !online || items.length > 0;
  const showInstallCard =
    !installDismissed && !isStandalone() && (installEvent !== null || showIosHint);

  return (
    <>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[2500] flex flex-col items-center gap-2 px-4 pb-4">
        {showInstallCard && (
          <div className="pointer-events-auto flex w-full max-w-[480px] items-center gap-3 rounded-2xl border border-card-border bg-card-bg px-4 py-3 shadow-xl">
            <Download
              size={20}
              className="shrink-0 text-green-700 dark:text-green-400"
            />
            <p className="min-w-0 flex-1 text-sm font-medium">
              {installEvent
                ? "Install Ana Quran for offline access and faster lessons."
                : "Install Ana Quran: tap Share, then “Add to Home Screen”."}
            </p>
            {installEvent && (
              <button
                type="button"
                onClick={() => void install()}
                className="shrink-0 rounded-xl bg-green-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-green-500"
              >
                Install
              </button>
            )}
            <button
              type="button"
              aria-label="Dismiss install offer"
              onClick={dismissInstall}
              className="shrink-0 rounded-full p-1 opacity-60 transition hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {showBanner && (
          <div
            role="status"
            className={`pointer-events-auto w-full max-w-[480px] rounded-2xl border px-4 py-3 shadow-xl ${
              online
                ? "border-card-border bg-card-bg text-foreground"
                : "border-[#9a6b1f66] bg-[#fbf3e4] text-[#9a6b1f] dark:border-[#e8c07a66] dark:bg-[#2a2113] dark:text-[#e8c07a]"
            }`}
          >
            <div className="flex items-center gap-3">
              {online ? (
                <RefreshCw size={18} className="shrink-0" />
              ) : (
                <WifiOff size={18} className="shrink-0" />
              )}
              <p className="min-w-0 flex-1 text-sm font-medium leading-5">
                {!online
                  ? "You're offline — showing saved data."
                  : failedCount > 0
                    ? `${failedCount} offline change${failedCount === 1 ? "" : "s"} need${failedCount === 1 ? "s" : ""} attention.`
                    : `${pendingCount} change${pendingCount === 1 ? "" : "s"} waiting to sync.`}
                {!online && pendingCount > 0 && (
                  <span className="block text-xs font-normal opacity-80">
                    {pendingCount} change{pendingCount === 1 ? "" : "s"} saved
                    on this device will sync when you reconnect.
                  </span>
                )}
              </p>
              {online && pendingCount > 0 && (
                <button
                  type="button"
                  onClick={() => void syncNow()}
                  className="shrink-0 rounded-xl bg-green-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-green-500"
                >
                  Sync now
                </button>
              )}
              {items.length > 0 && (
                <button
                  type="button"
                  aria-label={expanded ? "Hide saved changes" : "Show saved changes"}
                  onClick={() => setExpanded((value) => !value)}
                  className="shrink-0 rounded-full p-1 opacity-60 transition hover:opacity-100"
                >
                  {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
              )}
            </div>

            {expanded && items.length > 0 && (
              <ul className="mt-3 space-y-2 border-t border-card-border pt-3">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-2 rounded-xl bg-background/60 px-3 py-2 text-foreground"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs opacity-70">
                        {item.status === "failed"
                          ? (item.lastError ?? "The server refused this change.")
                          : "Waiting for a connection."}
                      </p>
                    </div>
                    {item.status === "failed" && online && (
                      <button
                        type="button"
                        onClick={() => void retryItem(item.id)}
                        className="shrink-0 rounded-lg border border-card-border px-2 py-1 text-xs font-semibold transition hover:border-green-500"
                      >
                        Retry
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label={`Discard ${item.label}`}
                      onClick={() => void discardItem(item.id)}
                      className="shrink-0 rounded-lg p-1 text-red-600 opacity-70 transition hover:opacity-100 dark:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </>
  );
}