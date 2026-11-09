/*
 * The push worker: the only code that runs when no tab of the site is open.
 *
 * A Web Push message arrives here, not in the app bundle, so a lesson call can
 * reach a laptop whose tab was closed. The payload is the small JSON written by
 * WebPushSender in the API.
 *
 * Sound: browsers take the tone from the operating system and ignore any choice
 * made by a page, so this cannot play the lesson ring — that is what the
 * in-tab ringer in src/lib/lesson-ringer.ts is for, and it only works while a
 * tab is open. `silent` is left false so the OS chime still fires.
 */

// Installing the new worker should not wait for old tabs to close: a missed
// lesson call is worse than a page that updates on the next navigation.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

const ICON = "/icon-192.png";

self.addEventListener("push", (event) => {
  // userVisibleOnly subscriptions break if a push is dropped without a
  // notification, so an unreadable payload still shows something.
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  const title = typeof data.title === "string" ? data.title : "Ana Quran";
  const body = typeof data.body === "string" ? data.body : "";
  // A lesson call is the one notice that should stay on screen until it is
  // dealt with, and replaces the previous unanswered ring instead of stacking.
  const urgent = data.urgent === true;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: ICON,
      badge: ICON,
      tag: typeof data.tag === "string" ? data.tag : "ana-quran",
      renotify: urgent,
      requireInteraction: urgent,
      vibrate: urgent ? [500, 400, 500, 400, 500] : undefined,
      data: { link: typeof data.link === "string" ? data.link : null },
    })
  );
});

// A push service expires subscriptions, and the page only learns about it the
// next time it tries to send. Re-subscribing here, from the worker, is the only
// way the ring survives that: no tab has to be open for it to happen.
// Omitting applicationServerKey reuses the VAPID key the first subscription was
// made with, and the API binds the new endpoint to whoever the cookie says is
// signed in in this browser.
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      const subscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
      });
      const json = subscription.toJSON();
      await fetch("/api/web-push/subscribe", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
        }),
      });
    })().catch(() => {
      // A closed session or an unconfigured server leaves the reader on the
      // in-app feed; the next page load registers again.
    })
  );
});

// Same-origin only: the link comes from the server, but a worker will happily
// open anything, and the app routes are all relative paths.
const appLink = (link) => {
  if (typeof link !== "string" || !link.startsWith("/") || link.startsWith("//")) {
    return "/";
  }
  return link;
};

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const link = appLink(data.link);

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // An open tab is told where to go so the reader keeps their session;
        // a bare window.focus() would leave them on the page they were on.
        // The message shape is the one the arrival-alert provider listens for,
        // so a click marks the row read and applies the reader's role.
        const existing = clientList.find((client) => "focus" in client);
        if (existing) {
          existing.postMessage({
            type: "academy-notification-click",
            link,
            id: data.id,
          });
          return existing.focus();
        }
        return self.clients.openWindow(link);
      })
  );
});
