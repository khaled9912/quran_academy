"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

export function useLessonRoomFlags() {
  const { data, isPending, isError, dataUpdatedAt } = useQuery({
    queryKey: LESSON_ROOM_FLAGS_KEY,
    queryFn: getLessonRoomFlags,
    staleTime: 30_000,
    gcTime: Infinity,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
    retry: false,
  });
  const loaded = useRef(false);
  if (!isPending) loaded.current = true;
  const [now, setNow] = useState(Date.now);
  const captureValidUntil =
    !isError && !isPending && data ? dataUpdatedAt + CAPTURE_FRESH_MS : 0;

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
