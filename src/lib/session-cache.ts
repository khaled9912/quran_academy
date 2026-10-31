import type { UserProfile } from "@/types/user";

// Identity snapshot only; the session itself stays in the HttpOnly cookie.
// This lets a returning user see their dashboard before /api/auth/me resolves.
const STORAGE_KEY = "academy:profile";

// useSyncExternalStore needs a stable snapshot, so the parsed object is cached
// and only re-read when the cache is written by this tab or another one.
let snapshot: UserProfile | null | undefined;
const listeners = new Set<() => void>();
let storageBound = false;

function notify() {
  listeners.forEach((listener) => listener());
}

export function getCachedProfileSnapshot(): UserProfile | null {
  if (snapshot === undefined) snapshot = readCachedProfile();
  return snapshot;
}

export function getCachedProfileServerSnapshot(): UserProfile | null {
  return null;
}

export function subscribeCachedProfile(listener: () => void) {
  listeners.add(listener);
  if (!storageBound && typeof window !== "undefined") {
    storageBound = true;
    window.addEventListener("storage", (event) => {
      if (event.key !== null && event.key !== STORAGE_KEY) return;
      snapshot = undefined;
      notify();
    });
  }
  return () => {
    listeners.delete(listener);
  };
}

function readCachedProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserProfile> | null;
    if (!parsed || typeof parsed !== "object" || !parsed.role) return null;
    return parsed as UserProfile;
  } catch {
    return null;
  }
}

export function writeCachedProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Private mode or a full quota must not break login.
  }
  snapshot = profile;
  notify();
}

export function clearCachedProfile() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clean up when storage is unavailable.
  }
  snapshot = null;
  notify();
}
