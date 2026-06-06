"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    const signOut = async () => {
      await supabase.auth.signOut();
      router.push("/login");
    };
    signOut();
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <div className="rounded-3xl border border-card-border bg-card-bg p-10 text-center shadow-lg">
        <p className="text-xl font-semibold">Signing out...</p>
      </div>
    </div>
  );
};

export default LogoutPage;
