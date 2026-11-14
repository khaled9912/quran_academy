/**
 * The number on the installed app's icon. The Badging API only exists where it
 * can mean something — an installed PWA on Android/desktop Chrome and Edge, or
 * a home-screen web app on iOS 16.4+ — and everywhere else these calls are a
 * quiet no-op, so callers never need to ask whether they are supported.
 */

declare global {
  interface Navigator {
    setAppBadge?(count?: number): Promise<void>;
    clearAppBadge?(): Promise<void>;
  }
}

export const syncAppBadge = async (unread: number) => {
  if (typeof navigator === "undefined") return;
  try {
    if (unread > 0) await navigator.setAppBadge?.(unread);
    else await navigator.clearAppBadge?.();
  } catch {
    // The browser refuses while no app is installed; the in-app bell already
    // carries the same count.
  }
};
