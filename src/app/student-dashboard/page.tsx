"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/student/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <p className="text-lg">Redirecting to Student Dashboard...</p>
    </div>
  );
}
