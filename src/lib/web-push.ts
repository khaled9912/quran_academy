import { backendFetch } from "@/lib/backend-client";
import { ensureAlertWorker } from "@/lib/notification-tray";

/**
 * Web Push: the browser-side half of "ring me even though my tab is closed".
 *
 * A subscription belongs to a browser profile, not to an account, so this code
 * keeps a small note of which account the endpoint was handed to and re-registers
 * when a different account signs in on the same laptop. The server moves the row
 * between users by endpoint for the same reason.
 *
 * Permission is never asked for here — that happens inside a click on the bell
 * menu (see `requestDesktopAlerts`), which is the only moment browsers allow.
 */

const OWNED_KEY = "ana-quran:web-push";

type OwnedSubscription = { endpoint: string; userId: string };

const supported = () =>
  typeof window !== "undefined" &&
  window.isSecureContext &&
  "Notification" in window &&
  "PushManager" in window &&
  "serviceWorker" in navigator;

const readOwned = (): OwnedSubscription | null => {
  try {
    const raw = localStorage.getItem(OWNED_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OwnedSubscription>;
    return typeof parsed.endpoint === "string" && typeof parsed.userId === "string"
      ? { endpoint: parsed.endpoint, userId: parsed.userId }
      : null;
  } catch {
    return null;
  }
};

const writeOwned = (owned: OwnedSubscription) => {
  try {
    localStorage.setItem(OWNED_KEY, JSON.stringify(owned));
  } catch {
    // Private mode without storage: the subscription still reaches the server.
  }
};

const clearOwned = () => {
  try {
    localStorage.removeItem(OWNED_KEY);
  } catch {
    // Nothing to clear.
  }
};

/** Base64url text from the API to the bytes pushManager expects. */
const toApplicationServerKey = (publicKey: string): Uint8Array => {
  const padded = publicKey
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(publicKey.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
};

type SubscriptionTriple = { endpoint: string; p256dh: string; auth: string };

const tripleOf = (subscription: PushSubscription): SubscriptionTriple => {
  const json = subscription.toJSON();
  return {
    endpoint: json.endpoint ?? "",
    p256dh: json.keys?.p256dh ?? "",
    auth: json.keys?.auth ?? "",
  };
};

/**
 * Makes sure this browser is registered to receive pushes for `userId`.
 * Safe to call on every sign-in: it does nothing when the note already says
 * this account owns the endpoint, and never prompts for permission.
 */
export const ensureWebPushSubscription = async (userId: string) => {
  if (!supported()) return;
  if (Notification.permission !== "granted") return;
  if (readOwned()?.userId === userId) return;

  const registration = await ensureAlertWorker();
  if (!registration) return;

  let subscription: PushSubscription | null = null;
  try {
    subscription = await registration.pushManager.getSubscription();
  } catch {
    return;
  }

  if (!subscription) {
    let publicKey: string;
    try {
      publicKey = (await backendFetch<{ key: string }>("/api/web-push/key")).key;
    } catch {
      // A 503 means the server has no VAPID pair yet; nothing to subscribe to.
      return;
    }
    if (!publicKey) return;
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: toApplicationServerKey(publicKey),
      });
    } catch {
      // Some browsers refuse here (a blocked push service, or no push at all).
      // The in-app feed and the open-tab ringer still work.
      return;
    }
  }
  if (!subscription) return;

  const triple = tripleOf(subscription);
  if (!triple.endpoint || !triple.p256dh || !triple.auth) return;
  try {
    await backendFetch("/api/web-push/subscribe", {
      method: "POST",
      body: JSON.stringify(triple),
    });
  } catch {
    // Not stored, so the next load retries instead of calling this settled.
    return;
  }
  writeOwned({ endpoint: triple.endpoint, userId });
};

/**
 * Detaches this browser from the account that signed out. The subscription
 * itself is kept: it belongs to the browser, and the next sign-in re-registers
 * it in one request instead of going through the push service again.
 */
export const dropWebPushSubscription = async () => {
  const owned = readOwned();
  if (!owned) return;
  clearOwned();
  if (!supported()) return;
  try {
    await backendFetch("/api/web-push/unsubscribe", {
      method: "POST",
      body: JSON.stringify({ endpoint: owned.endpoint, p256dh: "", auth: "" }),
    });
  } catch {
    // A stale row is dropped by the push service's own 404/410 cleanup.
  }
};
