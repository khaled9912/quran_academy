"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRecentCalls } from "@/services/lesson.service";
import type { LessonCall } from "@/types/lesson";
import { useAuth } from "@/providers/auth-provider";
import { IncomingCallAlert } from "@/components/lesson/IncomingCallAlert";
import {
  showBrowserNotice,
  startRinger,
  stopRinger,
} from "@/lib/lesson-ringer";
import { socketAwareInterval } from "@/lib/realtime-liveness";

/** A ring stops on its own; nobody should be chased by a call for an hour. */
const RING_TIMEOUT_MS = 45_000;

/** A call this old was not answered, so it belongs to the history, not a ring. */
const RING_WINDOW_MS = 90_000;

const TITLE_PREFIX = "Calling: ";

/** How often to look for a ring when no socket is delivering the `calls` scope. */
const RING_POLL_MS = 20_000;

/**
 * Rings for calls addressed to the signed-in user. The list query is the only
 * trigger: the realtime `calls` scope invalidates it the moment a call starts,
 * and connecting, reconnecting or returning to the tab sweeps it. The interval
 * therefore runs only while the socket is down (socketAwareInterval); window
 * focus refetches stay off globally in the query client.
 */
export function LessonRingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const [ringing, setRinging] = useState<LessonCall | null>(null);
  const rung = useRef(new Set<string>());

  const calls = useQuery({
    queryKey: ["lesson-calls"],
    queryFn: getRecentCalls,
    enabled: isAuthenticated,
    refetchInterval: socketAwareInterval(RING_POLL_MS),
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    const fresh = (calls.data ?? []).find(
      (call) =>
        !rung.current.has(call.id) &&
        Date.now() - Date.parse(call.createdAt) < RING_WINDOW_MS
    );
    if (!fresh) return;
    rung.current.add(fresh.id);
    setRinging(fresh);
    showBrowserNotice(
      `${fresh.callerName} is calling you`,
      "Open the lesson room to answer.",
      `/lesson/${fresh.lessonId}`
    );
  }, [calls.data, isAuthenticated]);

  useEffect(() => {
    if (!ringing) return;
    startRinger();
    const original = document.title;
    const caller = `${TITLE_PREFIX}${ringing.callerName} · ${original}`;
    let showingCaller = true;
    const flash = setInterval(() => {
      showingCaller = !showingCaller;
      document.title = showingCaller ? caller : original;
    }, 1_200);
    const timer = setTimeout(() => setRinging(null), RING_TIMEOUT_MS);
    return () => {
      stopRinger();
      clearInterval(flash);
      clearTimeout(timer);
      document.title = original;
    };
  }, [ringing]);

  const dismiss = useCallback(() => setRinging(null), []);

  if (!ringing) return <>{children}</>;
  return (
    <>
      {children}
      <IncomingCallAlert call={ringing} onDismiss={dismiss} />
    </>
  );
}
