/*
 * The app worker. Two jobs:
 *
 * 1. Push: the only code that runs when no tab of the site is open. A Web Push
 *    message arrives here, not in the app bundle, so a lesson call can reach a
 *    laptop whose tab was closed. The payload is the small JSON written by
 *    WebPushSender in the API.
 *
 * 2. Offline: the installed app keeps working with no network. Hashed build
 *    assets are cache-first, pages and the few read APIs a student needs are
 *    served stale-while-revalidate, and a navigation with nothing cached lands
 *    on /offline. Mutations are never cached or replayed here — the page's
 *    outbox (src/lib/offline) owns deferred writes so it can refresh the UI.
 *
 * Sound: browsers take the tone from the operating system and ignore any choice
 * made by a page, so this cannot play the lesson ring — that is what the
 * in-tab ringer in src/lib/lesson-ringer.ts is for, and it only works while a
 * tab is open. `silent` is left false so the OS chime still fires.
 */

// Installing the new worker should not wait for old tabs to close: a missed
// lesson call is worse than a page that updates on the next navigation.
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGES_CACHE);
      // Individually, so one unreachable asset cannot fail the whole install.
      await Promise.all(
        ["/offline", "/icon-192.png", "/icon-512.png"].map((path) =>
          cache.add(path).catch(() => {})
        )
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("aq-") && !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// ------------------------------------------------------------------ offline

const CACHE_VERSION = "aq-v1";
const PAGES_CACHE = `${CACHE_VERSION}-pages`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const ASSETS_CACHE = `${CACHE_VERSION}-assets`;
const DATA_CACHE = `${CACHE_VERSION}-data`;

const MAX_PAGES = 40;
const MAX_STATIC = 150;
const MAX_ASSETS = 120;
const MAX_DATA = 60;

// Read APIs whose last answer is worth showing offline. Auth, push, realtime
// and anything admin-facing are deliberately absent: a stale session or a
// stale ops queue is worse than an honest "you're offline".
const DATA_PATTERNS = [
  /^\/api\/lessons(\/|\?|$)/,
  /^\/api\/student\/series$/,
  /^\/api\/student\/teacher\/weekly-availability$/,
  /^\/api\/notifications$/,
  /^\/api\/lesson-policy$/,
  /^\/api\/profile$/,
  /^\/api\/teachers(\/|\?|$)/,
];

// Routes that must always hit the network: live rooms, sign-out, the Sentry
// tunnel, and dev hot-reload plumbing.
const NEVER_CACHE = /^\/(api\/(auth|web-push|realtime)|monitoring|lesson(\/|$)|logout|_next\/webpack-hmr|__nextjs)/;

const trimCache = async (cacheName, maxEntries) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)));
};

const fetchWithTimeout = (request, ms) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(request, { signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
};

const isHtml = (response) =>
  (response.headers.get("content-type") ?? "").includes("text/html");

const isJson = (response) =>
  (response.headers.get("content-type") ?? "").includes("json");

// Pages: fresh when the network answers, last visit when it does not, and the
// offline sheet when neither exists. Redirected answers (e.g. a proxy bounce
// to /login) are never stored under the URL that was asked for.
const handleNavigation = async (request) => {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const response = await fetchWithTimeout(request, 8000);
    if (response.ok && !response.redirected && isHtml(response)) {
      await cache.put(request, response.clone());
      await trimCache(PAGES_CACHE, MAX_PAGES);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const offline = await cache.match("/offline");
    return offline ?? Response.error();
  }
};

// Hashed build files never change content at the same URL.
const handleImmutableStatic = async (request) => {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
    await trimCache(STATIC_CACHE, MAX_STATIC);
  }
  return response;
};

// Public images, fonts and styles: serve what we have, refresh in the background.
const handleAsset = async (request) => {
  const cache = await caches.open(ASSETS_CACHE);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
        await trimCache(ASSETS_CACHE, MAX_ASSETS);
      }
      return response;
    })
    .catch(() => null);
  if (cached) return { response: cached, background: refresh };
  const response = await refresh;
  return { response: response ?? Response.error(), background: null };
};

// Read APIs: answer from cache immediately when offline, and whenever the
// network is slow or down. Online, the network answer wins and refills the
// cache; only successful JSON is stored, never a 401/403 body.
const handleData = async (request) => {
  const cache = await caches.open(DATA_CACHE);
  try {
    const response = await fetchWithTimeout(request, 4000);
    if (response.ok && isJson(response)) {
      await cache.put(request, response.clone());
      await trimCache(DATA_CACHE, MAX_DATA);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached ?? Response.error();
  }
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (NEVER_CACHE.test(url.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(handleImmutableStatic(request));
    return;
  }
  if (DATA_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(handleData(request));
    return;
  }
  if (/\.(png|jpe?g|svg|webp|ico|woff2?|ttf|css|js)$/.test(url.pathname)) {
    const asset = handleAsset(request);
    event.respondWith(asset.then((result) => result.response));
    // The stale answer goes out now; the refresh may finish after it.
    event.waitUntil(asset.then((result) => result.background ?? Promise.resolve()));
  }
});

// Signing out (or a session expiring) must not leave the previous reader's
// pages and answers cached for whoever signs in next on this device.
self.addEventListener("message", (event) => {
  if (event.data?.type === "academy-clear-data") {
    event.waitUntil(
      Promise.all([caches.delete(DATA_CACHE), caches.delete(PAGES_CACHE)]).then(
        // The offline fallback page is public; keep it for the next reader.
        () =>
          caches
            .open(PAGES_CACHE)
            .then((cache) => cache.add("/offline"))
            .catch(() => {})
      )
    );
  }
});

// Background Sync: the browser woke us because the network returned. The
// replay itself runs in a tab so it can refresh queries and toast the result.
self.addEventListener("sync", (event) => {
  if (event.tag !== "academy-outbox") return;
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          client.postMessage({ type: "academy-sync-outbox" });
        }
      })
  );
});

// --------------------------------------------------------------------- push

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
  // The sender counts the reader's unread notices, so the installed app's icon
  // can carry the same number the in-app bell does — with no tab open to ask.
  const badge = typeof data.badge === "number" ? data.badge : null;

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(title, {
        body,
        icon: ICON,
        badge: ICON,
        tag: typeof data.tag === "string" ? data.tag : "ana-quran",
        renotify: urgent,
        requireInteraction: urgent,
        vibrate: urgent ? [500, 400, 500, 400, 500] : undefined,
        data: { link: typeof data.link === "string" ? data.link : null },
      });
      if (badge === null || !("setAppBadge" in navigator)) return;
      try {
        if (badge > 0) await navigator.setAppBadge(badge);
        else await navigator.clearAppBadge();
      } catch {
        // Badging is refused while no app is installed; the notification itself
        // already landed.
      }
    })()
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