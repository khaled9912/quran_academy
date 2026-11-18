/**
 * App-worker plumbing shared by the PWA provider and anything that needs the
 * registration. Registration itself is deferred to after first paint — the
 * worker is an enhancement, never a prerequisite for the page.
 */

export const registerAppWorker =
  async (): Promise<ServiceWorkerRegistration | undefined> => {
    if (
      typeof window === "undefined" ||
      !window.isSecureContext ||
      !("serviceWorker" in navigator)
    ) {
      return undefined;
    }
    try {
      const existing = await navigator.serviceWorker.getRegistration();
      if (existing) return existing;
      return await navigator.serviceWorker.register("/sw.js");
    } catch {
      // Push and offline are enhancements; the site works without them.
      return undefined;
    }
  };

/** Wipes cached pages and API answers so the next reader on this device
 * never sees the previous one's data. */
export const clearOfflineData = async () => {
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    registration?.active?.postMessage({ type: "academy-clear-data" });
  } catch {
    // No worker yet means nothing was cached.
  }
};

export const isStandalone = (): boolean =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true);

export const isIosDevice = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return true;
  // iPadOS 13+ masquerades as a Mac; touch points give it away.
  return /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
};

export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};