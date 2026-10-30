import { backendFetch } from "@/lib/backend-client";
import type { UserProfile } from "@/types/user";

export interface AuthResponse { user: UserProfile; }

export const signIn = (email: string, password: string) =>
  backendFetch<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

/** Public registration intentionally creates Students only. */
export const signUp = (fullName: string, email: string, password: string) =>
  backendFetch<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify({ fullName, email, password }) });

let currentUserRequest: Promise<UserProfile | null> | null = null;

/**
 * Restores the session from the HttpOnly cookie. Concurrent callers share one
 * in-flight request so the AuthProvider and any page-level check never trigger
 * duplicate `/api/auth/me` calls.
 */
export const getCurrentUser = (): Promise<UserProfile | null> => {
  if (currentUserRequest) return currentUserRequest;
  currentUserRequest = (async () => {
    try {
      const result = await backendFetch<UserProfile | AuthResponse>("/api/auth/me");
      if (!result) return null;
      return typeof result === "object" && "user" in result ? (result as AuthResponse).user : (result as UserProfile);
    } catch (error) {
      if (error instanceof Error && "status" in error && (error as { status: number }).status === 401) return null;
      throw error;
    } finally {
      currentUserRequest = null;
    }
  })();
  return currentUserRequest;
};

export const signOut = () => backendFetch<null>("/api/auth/logout", { method: "POST" });
