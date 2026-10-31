"use client";
import { useEffect } from "react";
import { signOut } from "@/services/auth.service";
import { reportUnexpectedError } from "@/lib/sentry";
import { clearCachedProfile } from "@/lib/session-cache";
export default function LogoutPage() {
  useEffect(() => {
    signOut()
      .catch((error) => reportUnexpectedError(error))
      .finally(() => {
        clearCachedProfile();
        document.cookie = "user-role=; Path=/; Max-Age=0; SameSite=Lax";
        // Full navigation is intentional: it drops the in-memory session so the
        // provider cannot redirect back to the dashboard from /login.
        window.location.replace("/login");
      });
  }, []);
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <div className="rounded-3xl border border-card-border bg-card-bg p-10 text-center shadow-lg">
        <p className="text-xl font-semibold">Signing out...</p>
      </div>
    </div>
  );
}
