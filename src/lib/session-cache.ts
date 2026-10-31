import type { UserProfile } from "@/types/user";

// Identity snapshot only; the session itself stays in the HttpOnly cookie.
// This lets a returning user see their dashboard before /api/auth/me resolves.
const STORAGE_KEY = "academy:profile";

export function readCachedProfile(): UserProfile | null {
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
}

export function clearCachedProfile() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clean up when storage is unavailable.
  }
}
