"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { UserProfile, UserRole } from "@/types/user";
import { getCurrentUser, signOut } from "@/services/auth.service";
import { reportUnexpectedError } from "@/lib/sentry";
import { hasPermission } from "@/lib/permissions";
import { ROLE_DASHBOARDS } from "@/constants/role-routes";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  clearCachedProfile,
  readCachedProfile,
  writeCachedProfile,
} from "@/lib/session-cache";

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  role: UserRole | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  applySession: (user: UserProfile | null) => void;
  updateUser: (user: UserProfile) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: true,
  applySession: () => {},
  updateUser: () => {},
  logout: async () => {},
});

const AUTH_PAGES = new Set(["/login", "/signup", "/register"]);
const PROTECTED_PREFIXES = [
  "/profile",
  "/student",
  "/teacher",
  "/admin",
  "/super-admin",
  "/schedule",
  "/student-dashboard",
  "/lesson",
];

const isProtectedPath = (pathname: string) =>
  PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

function syncRoleCookie(role: UserRole | null) {
  if (typeof document === "undefined") return;
  document.cookie = role
    ? `user-role=${encodeURIComponent(role)}; Path=/; Max-Age=86400; SameSite=Lax`
    : "user-role=; Path=/; Max-Age=0; SameSite=Lax";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  // Redirects must key off where the user landed, not later navigation.
  const initialPathRef = useRef(pathname);

  const [profile, setProfile] = useState<UserProfile | null>(readCachedProfile);
  const profileRef = useRef<UserProfile | null>(profile);
  profileRef.current = profile;

  // Only a protected page without a cached identity has to wait for the API.
  const [isLoading, setIsLoading] = useState(
    () => !profile && isProtectedPath(initialPathRef.current)
  );

  /** Single entry point for every session change (restore, login, logout). */
  const applySession = useCallback(
    (next: UserProfile | null) => {
      profileRef.current = next;
      setProfile(next);
      syncRoleCookie(next?.role ?? null);
      if (next) {
        writeCachedProfile(next);
        setUser(next);
      } else {
        clearCachedProfile();
        clearUser();
      }
      queryClient.clear();
      hasRedirected.current = false;
    },
    [queryClient, setUser, clearUser]
  );

  /** Updates the cached identity without resetting session-wide queries. */
  const updateUser = useCallback(
    (next: UserProfile) => {
      profileRef.current = next;
      setProfile(next);
      syncRoleCookie(next.role);
      writeCachedProfile(next);
      setUser(next);
    },
    [setUser]
  );

  useEffect(() => {
    let active = true;
    const cached = profileRef.current;
    if (cached) {
      setUser(cached);
      syncRoleCookie(cached.role);
    }

    const hasSessionHint = document.cookie
      .split("; ")
      .some(
        (entry) =>
          entry.startsWith("user-role=") && entry.length > "user-role=".length
      );

    // Public pages never call /api/auth/me without a local identity or session
    // hint: the HttpOnly cookie is sent by the browser, so there is nothing to
    // restore and no reason to hold the render.
    if (!cached && !hasSessionHint && !isProtectedPath(initialPathRef.current)) {
      setIsLoading(false);
      return;
    }

    // Revalidate in the background; a valid identity is already on screen.
    getCurrentUser()
      .then((currentUser) => {
        if (!active) return;
        if (!currentUser) {
          applySession(null);
          return;
        }
        if (profileRef.current) updateUser(currentUser);
        else applySession(currentUser);
      })
      .catch((error) => {
        // A 401 is expected here and already resolves to null above; keep the
        // cached identity on network failures so offline users are not logged out.
        reportUnexpectedError(error);
        if (active && !profileRef.current) applySession(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applySession, updateUser, setUser]);

  // A restored session can expire server-side (API restarts invalidate cookies).
  // backendFetch signals this so pages do not sit on empty, unauthorized lists.
  useEffect(() => {
    const handleUnauthorized = () => applySession(null);
    window.addEventListener("academy:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("academy:unauthorized", handleUnauthorized);
  }, [applySession]);

  // Centralized redirects: pages never redirect themselves, so a session
  // restore and a login submit can never race into a redirect loop.
  useEffect(() => {
    if (isLoading) return;
    if (hasRedirected.current) return;

    if (profile) {
      if (!AUTH_PAGES.has(pathname)) return;
      hasRedirected.current = true;
      router.replace(ROLE_DASHBOARDS[profile.role] ?? "/");
      return;
    }

    if (!isProtectedPath(pathname)) return;
    hasRedirected.current = true;
    router.replace("/login");
  }, [isLoading, profile, pathname, router]);

  const logout = async () => {
    try {
      await signOut();
    } finally {
      applySession(null);
      router.replace("/login");
      router.refresh();
    }
  };

  const role = profile?.role ?? null;
  const permissions = useMemo(() => {
    if (!role) return [];
    if (role === "super_admin") return ["*"];
    if (role === "admin")
      return [
        "manage_students",
        "manage_teachers",
        "manage_assignments",
        "manage_lessons",
        "view_reports",
      ];
    if (role === "teacher") return ["view_students", "view_lessons"];
    return ["view_lessons"];
  }, [role]);
  const value: AuthContextType = {
    user: profile,
    profile,
    role,
    permissions,
    isAuthenticated: !!profile,
    isLoading,
    applySession,
    updateUser,
    logout,
  };
  // Public pages render immediately while the session is still restoring; only
  // protected routes wait, and they show a visible loader instead of a blank page.
  const holdForAuth = isLoading && isProtectedPath(pathname);

  return (
    <AuthContext.Provider value={value}>
      {holdForAuth ? <AuthLoadingScreen /> : children}
    </AuthContext.Provider>
  );
}

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 pt-24 text-foreground">
      <span
        aria-hidden
        className="h-7 w-7 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
      />
      <p className="text-sm opacity-70">Loading your session…</p>
    </div>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
export function usePermission(permission: string) {
  const { role } = useAuth();
  return hasPermission(role, permission);
}
