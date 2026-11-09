/**
 * Desktop alerts: the OS-level notification that lands in the same swipe tray
 * the phone app uses, so a booking or a lesson change reaches the reader while
 * the tab is in their pocket. The sound stays the in-tab ping in
 * `notification-sounder` — browsers ignore a sound choice on page
 * notifications, and playing both would echo.
 */
const available = () => {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  // A plain http origin gets neither the permission prompt nor a worker.
  return window.isSecureContext;
};

export type DesktopPermission = NotificationPermission | "unsupported";

export const desktopPermission = (): DesktopPermission =>
  available() ? Notification.permission : "unsupported";

/**
 * The click-handling worker is what makes Chrome on Android show the
 * notification at all — that browser ignores the plain constructor. It has to
 * be installed and active first, so it goes in with the permission request.
 *
 * It is also the transport for Web Push, which cannot subscribe without a
 * registration, so the push code reuses this instead of registering a worker of
 * its own.
 */
export const ensureAlertWorker =
  async (): Promise<ServiceWorkerRegistration | undefined> => {
    if (!available() || !("serviceWorker" in navigator)) return undefined;
    try {
      const existing = await navigator.serviceWorker.getRegistration();
      if (existing) return existing;
      return await navigator.serviceWorker.register("/sw.js");
    } catch {
      // Desktop readers still get alerts through the constructor.
      return undefined;
    }
  };

/** Ask from inside a click — Safari rejects the prompt anywhere else. */
export const requestDesktopAlerts = async (): Promise<DesktopPermission> => {
  if (!available()) return "unsupported";
  try {
    await ensureAlertWorker();
    return await Notification.requestPermission();
  } catch {
    return "unsupported";
  }
};

type Alert = {
  id: string;
  title: string;
  body: string;
  /** App route the alert opens; the worker hands it back to a running tab. */
  link: string | null;
};

/**
 * Alerts only while the tab is hidden: a focused tab already has the badge, the
 * chime, and the live feed, so a system banner over the reader's own screen
 * would be noise.
 */
export const showDesktopAlert = async ({ id, title, body, link }: Alert) => {
  if (desktopPermission() !== "granted") return;
  if (document.visibilityState === "visible") return;
  const options: NotificationOptions = {
    body,
    // The id as the tag replaces the banner for the same notification instead
    // of stacking a duplicate when the feed refetches.
    tag: id,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { link, id },
  };
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration?.active) {
      await registration.showNotification(title, options);
      return;
    }
  } catch {
    // Fall through to the constructor.
  }
  void new Notification(title, options);
};
