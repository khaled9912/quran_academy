/**
 * Replays the outbox once the network is back. Runs in the page (not the
 * worker) so a finished sync can refresh the visible queries and tell the
 * reader what landed. Items are replayed in the order they were made; a
 * server refusal keeps the item for the reader to retry or discard, because
 * silently dropping a report a teacher wrote offline would lose their work.
 */
import { dispatchToast } from "@/lib/toast";
import {
  OUTBOX_CHANGED_EVENT,
  OUTBOX_SYNCED_EVENT,
  getOutboxItems,
  discardOutboxItem,
  type OutboxItem,
} from "./outbox";
import { outboxPut } from "./db";

let syncing = false;
let retryDelayMs = 5_000;
let retryTimer: number | null = null;
let listenersStarted = false;

const announceChange = () =>
  window.dispatchEvent(new CustomEvent(OUTBOX_CHANGED_EVENT));

const refusalMessage = (status: number, payload: unknown): string => {
  if (
    status < 500 &&
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof (payload as { message: unknown }).message === "string"
  ) {
    return (payload as { message: string }).message;
  }
  return "The server refused this change. Review it, then retry or discard.";
};

const scheduleRetry = () => {
  if (retryTimer !== null) return;
  retryTimer = window.setTimeout(() => {
    retryTimer = null;
    void syncOutbox();
  }, retryDelayMs);
  retryDelayMs = Math.min(retryDelayMs * 2, 5 * 60_000);
};

export const syncOutbox = async (): Promise<void> => {
  if (syncing || typeof navigator === "undefined" || !navigator.onLine) return;
  syncing = true;
  let synced = 0;
  let refused = 0;
  try {
    const items = await getOutboxItems();
    for (const item of items) {
      if (item.status !== "pending") continue;
      if (!navigator.onLine) break;
      let response: Response;
      try {
        response = await fetch(item.path, {
          method: item.method,
          credentials: "include",
          cache: "no-store",
          headers: item.body ? { "Content-Type": "application/json" } : undefined,
          body: item.body ?? undefined,
        });
      } catch {
        // The network dropped again mid-replay; keep the rest for later.
        scheduleRetry();
        break;
      }
      if (response.ok || response.status === 204) {
        await discardOutboxItem(item.id);
        synced += 1;
        retryDelayMs = 5_000;
        continue;
      }
      if (response.status === 401) {
        // The session expired while offline; signing in again resumes the sync.
        window.dispatchEvent(new Event("academy:unauthorized"));
        break;
      }
      if (response.status < 500) {
        const payload = await response.json().catch(() => null);
        const failed: OutboxItem = {
          ...item,
          status: "failed",
          attempts: item.attempts + 1,
          lastError: refusalMessage(response.status, payload),
        };
        await outboxPut(failed);
        refused += 1;
        announceChange();
        continue;
      }
      // A server-side fault is not the item's fault — retry the whole queue later.
      scheduleRetry();
      break;
    }
  } finally {
    syncing = false;
  }
  if (synced > 0) {
    dispatchToast(
      synced === 1
        ? "Your offline change has been synced."
        : `${synced} offline changes have been synced.`,
      "success"
    );
    window.dispatchEvent(new CustomEvent(OUTBOX_SYNCED_EVENT));
  }
  if (refused > 0) {
    dispatchToast(
      "Some offline changes need your attention. Open the sync banner to review them.",
      "warning"
    );
  }
};

/** One set of triggers for the whole app: reconnect, tab focus, the worker's
 * Background Sync nudge, a slow safety timer, and the first load. */
export const startOutboxSync = () => {
  if (listenersStarted || typeof window === "undefined") return;
  listenersStarted = true;
  window.addEventListener("online", () => void syncOutbox());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void syncOutbox();
  });
  navigator.serviceWorker?.addEventListener("message", (event) => {
    if (event.data?.type === "academy-sync-outbox") void syncOutbox();
  });
  window.setInterval(() => {
    if (navigator.onLine) void syncOutbox();
  }, 60_000);
  void syncOutbox();
};