"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/backend-client";
import {
  LESSON_ROOM_FLAGS_KEY,
  getLessonRoomFlags,
  type LessonRoomFlags,
} from "@/services/lesson-room-config.service";

const FLAGS_OFF: LessonRoomFlags = {
  whiteboard: false,
  chat: false,
  cameraBackground: false,
  pen: false,
  performanceSettings: false,
  transcription: false,
  reportConcern: false,
};

// Refresh at 30s, allowing a bounded fetch grace period. Capture also checks
// this deadline in every speech callback, even when background timers throttle.
const CAPTURE_FRESH_MS = 45_000;

/**
 * A 404 means the API build has no such route, which no amount of asking will
 * change. Every other status is worth another attempt.
 */
const isMissingRoute = (error: unknown) => error instanceof ApiError && error.status === 404;

/**
 * @param liveRoom Whether a lesson room is open. The flags are fetched once with
 * the app so joining a room never waits on this call, and they only need to be
 * refreshed while a room is actually using them — an open tab polled the endpoint
 * for hours on end otherwise, from every page including the login screen.
 */
export function useLessonRoomFlags(liveRoom = false) {
  const { data, isPending, isError, dataUpdatedAt, refetch } = useQuery({
    queryKey: LESSON_ROOM_FLAGS_KEY,
    queryFn: getLessonRoomFlags,
    staleTime: 30_000,
    gcTime: Infinity,
    refetchInterval: (query) =>
      isMissingRoute(query.state.error) || !liveRoom ? false : 30_000,
    retry: (attempt, error) => !isMissingRoute(error) && attempt < 2,
    retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 10_000),
  });
  const loaded = useRef(false);
  if (!isPending) loaded.current = true;
  const [now, setNow] = useState(Date.now);
  const captureValidUntil =
    !isError && !isPending && data ? dataUpdatedAt + CAPTURE_FRESH_MS : 0;

  // Opening a room restarts the refresh loop, and the read it triggers is what
  // makes the capture deadline count again: a flags answer from before the tab
  // went idle is too old to decide whether transcription may run.
  useEffect(() => {
    if (liveRoom) void refetch();
  }, [liveRoom, refetch]);

  useEffect(() => {
    setNow(Date.now());
    if (!captureValidUntil) return;
    const timer = window.setTimeout(
      () => setNow(Date.now()),
      Math.max(0, captureValidUntil - Date.now()) + 1
    );
    const check = () => setNow(Date.now());
    window.addEventListener("pageshow", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pageshow", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [captureValidUntil]);

  const fresh = captureValidUntil > Math.max(now, Date.now());
  return {
    // Jitsi snapshots its toolbar at construction; refreshed capture flags
    // must never be dependencies of the room-construction effect.
    flags: {
      ...(data ?? FLAGS_OFF),
      transcription: fresh && data?.transcription === true,
      reportConcern: fresh && data?.reportConcern === true,
    },
    captureValidUntil,
    // Cache resets/refetches must not unmount an already-running room.
    flagsLoaded: loaded.current,
  };
}
