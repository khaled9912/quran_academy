"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";
import { UserProfile, UserRole } from "@/types/user";
import { hasPermission } from "@/lib/permissions";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: true,
  logout: async () => {},
});

const setCookie = (name: string, value: string, maxAgeSeconds: number) => {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax; Secure`;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax; Secure`;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setUser: setStoreUser, clearUser: clearStoreUser } = useAuthStore();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    clearStoreUser();
    deleteCookie("sb-access-token");
    deleteCookie("sb-refresh-token");
    deleteCookie("user-role");
    router.push("/");
  };

  const fetchProfileAndSync = async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      setProfile(null);
      clearStoreUser();
      deleteCookie("sb-access-token");
      deleteCookie("sb-refresh-token");
      deleteCookie("user-role");
      setIsLoading(false);
      return;
    }

    try {
      setUser(session.user);

      // Set session cookies for Next.js middleware
      setCookie(
        "sb-access-token",
        session.access_token,
        session.expires_in || 3600
      );
      if (session.refresh_token) {
        setCookie("sb-refresh-token", session.refresh_token, 30 * 24 * 60 * 60);
      }

      // Fetch user profile from database
      const { data: dbProfile, error } = await supabase
        .from("profiles")
        .select(
          "id, email, role, first_name, last_name, full_name, is_active, avatar_url, created_at"
        )
        .eq("id", session.user.id)
        .single();

      if (error || !dbProfile) {
        console.error("Error fetching user profile:", error);
        // Fallback: build profile from session if table sync fails initially
        const fallbackProfile: UserProfile = {
          id: session.user.id,
          email: session.user.email || "",
          role: "student", // default role
          is_active: true,
        };
        setProfile(fallbackProfile);
        setStoreUser(fallbackProfile);
        setCookie("user-role", "student", 3600);
      } else {
        if (!dbProfile.is_active) {
          alert("Your account is deactivated. Logging out.");
          await handleSignOut();
          return;
        }

        setProfile(dbProfile as UserProfile);
        setStoreUser(dbProfile as UserProfile);
        setCookie("user-role", dbProfile.role, 3600);
      }
    } catch (err) {
      console.error("Failed to sync auth state:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfileAndSync(session);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        clearStoreUser();
        deleteCookie("sb-access-token");
        deleteCookie("sb-refresh-token");
        deleteCookie("user-role");
        setIsLoading(false);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await fetchProfileAndSync(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    role: profile?.role || null,
    permissions: profile?.role
      ? profile.role === "super_admin"
        ? ["*"]
        : profile.role === "admin"
          ? [
              "manage_students",
              "manage_teachers",
              "manage_courses",
              "view_reports",
            ]
          : profile.role === "teacher"
            ? ["view_students", "mark_attendance", "create_assignments"]
            : ["view_courses", "submit_homework"]
      : [],
    isAuthenticated: !!user,
    isLoading,
    logout: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function usePermission(permission: string) {
  const { role } = useAuth();
  return hasPermission(role, permission);
}
