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
import { hasPermission } from "@/lib/permissions";
import { ROLE_DASHBOARDS } from "@/constants/role-routes";
import { useAuthStore } from "@/stores/useAuthStore";

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

function syncRoleCookie(role: UserRole | null) {
  if (typeof document === "undefined") return;
  document.cookie = role
    ? `user-role=${encodeURIComponent(role)}; Path=/; Max-Age=86400; SameSite=Lax`
    : "user-role=; Path=/; Max-Age=0; SameSite=Lax";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setUser, clearUser } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  /** Single entry point for every session change (restore, login, logout). */
  const applySession = useCallback(
    (next: UserProfile | null) => {
      setProfile(next);
      syncRoleCookie(next?.role ?? null);
      if (next) setUser(next);
      else clearUser();
      queryClient.clear();
      hasRedirected.current = false;
    },
    [queryClient, setUser, clearUser]
  );

  /** Updates the cached identity without resetting session-wide queries. */
  const updateUser = useCallback(
    (next: UserProfile) => {
      setProfile(next);
      setUser(next);
    },
    [setUser]
  );

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((currentUser) => {
        if (active) applySession(currentUser);
      })
      .catch((error) => {
        console.error("Unable to restore API session:", error);
        if (active) applySession(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applySession]);

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

    const isProtected = PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
    if (!isProtected) return;
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
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
export function usePermission(permission: string) {
  const { role } = useAuth();
  return hasPermission(role, permission);
}
