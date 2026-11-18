/**
 * The outbox: changes a signed-in user made while offline, kept on the device
 * until the network returns. Only operations that stay correct when delayed
 * are queueable — post-lesson reports, reviews, issue reports and read marks.
 * Time-sensitive actions (cancelling, rescheduling, switching weekly times,
 * paying) are never queued; the API client refuses them while offline.
 */
import { outboxDelete, outboxGetAll, outboxPut } from "./db";

export type OutboxItem = {
  id: string;
  kind: string;
  label: string;
  method: string;
  path: string;
  body: string | null;
  createdAt: number;
  status: "pending" | "failed";
  attempts: number;
  lastError?: string;
};

export const OUTBOX_CHANGED_EVENT = "academy:outbox-changed";
export const OUTBOX_SYNCED_EVENT = "academy:outbox-synced";

type QueueRule = {
  pattern: RegExp;
  kind: string;
  label: string;
  /** Read marks resolve optimistically; the caller never sees the queue. */
  silent: boolean;
};

const QUEUE_RULES: QueueRule[] = [
  {
    pattern: /^\/api\/notifications\/[^/]+\/read$/,
    kind: "notification-read",
    label: "Mark a notification read",
    silent: true,
  },
  {
    pattern: /^\/api\/notifications\/read-all$/,
    kind: "notifications-read-all",
    label: "Mark all notifications read",
    silent: true,
  },
  {
    pattern: /^\/api\/lessons\/[^/]+\/report$/,
    kind: "lesson-report",
    label: "Class report",
    silent: false,
  },
  {
    pattern: /^\/api\/lessons\/[^/]+\/review$/,
    kind: "lesson-review",
    label: "Lesson review",
    silent: false,
  },
  {
    pattern: /^\/api\/lessons\/[^/]+\/incident$/,
    kind: "lesson-incident",
    label: "Lesson issue report",
    silent: false,
  },
];

const announceChange = () => {
  window.dispatchEvent(new CustomEvent(OUTBOX_CHANGED_EVENT));
};

/**
 * Matches a mutation against the queueable set. Returns the rule, or null
 * when the action must not be deferred.
 */
export const matchQueueable = (path: string, method: string) => {
  if (method !== "POST") return null;
  return QUEUE_RULES.find((rule) => rule.pattern.test(path)) ?? null;
};

/**
 * Stores the change for replay. A second edit of the same target replaces the
 * first — the latest report or review is the one worth syncing.
 */
export const enqueueOfflineChange = async (
  path: string,
  method: string,
  body: string | null
): Promise<{ silent: boolean }> => {
  const rule = matchQueueable(path, method);
  if (!rule) throw new Error("This action cannot be queued offline.");
  const existing = await outboxGetAll();
  const superseded = (existing as OutboxItem[]).filter(
    (item) => item.path === path && item.method === method
  );
  for (const item of superseded) await outboxDelete(item.id);
  const item: OutboxItem = {
    id: crypto.randomUUID(),
    kind: rule.kind,
    label: rule.label,
    method,
    path,
    body,
    createdAt: Date.now(),
    status: "pending",
    attempts: 0,
  };
  await outboxPut(item);
  announceChange();
  void registerBackgroundSync();
  return { silent: rule.silent };
};

export const getOutboxItems = async (): Promise<OutboxItem[]> =>
  ((await outboxGetAll()) as OutboxItem[]).sort(
    (a, b) => a.createdAt - b.createdAt
  );

export const discardOutboxItem = async (id: string) => {
  await outboxDelete(id);
  announceChange();
};

export const retryOutboxItem = async (id: string) => {
  const items = (await outboxGetAll()) as OutboxItem[];
  const item = items.find((entry) => entry.id === id);
  if (!item) return;
  await outboxPut({ ...item, status: "pending", lastError: undefined });
  announceChange();
};

/** Chrome's Background Sync replays even with no tab open; elsewhere the
 * online event and the app's own timer do the same job. */
export const registerBackgroundSync = async () => {
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    const sync = (registration as ServiceWorkerRegistration & {
      sync?: { register: (tag: string) => Promise<void> };
    })?.sync;
    await sync?.register("academy-outbox");
  } catch {
    // Not supported or refused — the in-page sync engine covers it.
  }
};