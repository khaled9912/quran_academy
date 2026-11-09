"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/providers/auth-provider";
import { RealtimeProvider } from "@/providers/realtime-provider";
import { LessonRingProvider } from "@/providers/lesson-ring-provider";
import { WebPushProvider } from "@/providers/web-push-provider";
import { NotificationAlertProvider } from "@/providers/notification-alert-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { createQueryClient } from "@/lib/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <RealtimeProvider>
            <WebPushProvider>
              <LessonRingProvider>
                <NotificationAlertProvider>{children}</NotificationAlertProvider>
              </LessonRingProvider>
            </WebPushProvider>
          </RealtimeProvider>
        </AuthProvider>
      </ToastProvider>
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}
