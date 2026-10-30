"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/services/auth.service";
export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    signOut().catch((error) => console.error("Logout request failed:", error)).finally(() => {
      document.cookie = "user-role=; Path=/; Max-Age=0; SameSite=Lax";
      router.replace("/login"); router.refresh();
    });
  }, [router]);
  return <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8"><div className="rounded-3xl border border-card-border bg-card-bg p-10 text-center shadow-lg"><p className="text-xl font-semibold">Signing out...</p></div></div>;
}
