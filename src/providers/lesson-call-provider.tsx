"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Minimize2, PenLine, PhoneOff, PictureInPicture2 } from "lucide-react";
import { JitsiRoom } from "@/components/JitsiRoom";
import { LessonPenOverlay } from "@/components/lesson/LessonPenOverlay";
import { useAuth } from "@/providers/auth-provider";
import { useRealtimeConnection } from "@/providers/realtime-provider";
import { sendAttendanceEvent } from "@/services/lesson.service";
import type { JitsiExternalApi } from "@/types/jitsi";

/** The lesson's one-share lock, as the hub reports it. */
type ShareState = { on?: boolean; holder?: string | null };
type ShareClaim = { accepted?: boolean; holder?: string | null };

export interface ActiveLessonCall {
  lessonId: string;
  room: string;
  domain: string;
  displayName: string;
  backHref: string;
  /** Admins join as support and must not affect participant attendance. */
  trackAttendance?: boolean;
}

interface LessonCallContextValue {
  call: ActiveLessonCall | null;
  startCall: (call: ActiveLessonCall) => void;
  endCall: () => void;
  minimized: boolean;
  setMinimized: (minimized: boolean) => void;
}

const LessonCallContext = createContext<LessonCallContextValue | null>(null);

const DEVICE_KEY = "ana-quran-device-id";

const getDeviceId = () => {
  let value = window.localStorage.getItem(DEVICE_KEY);
  if (!value) {
    value =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(DEVICE_KEY, value);
  }
  return value;
};

const newEventId = (action: string) =>
  `${action}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export function useLessonCall() {
  const context = useContext(LessonCallContext);
  if (!context) {
    throw new Error("useLessonCall must be used inside LessonCallProvider");
  }
  return context;
}

/**
 * Owns the live Jitsi conference for the whole app. Mounted in the root
 * layout, so client-side navigation never unmounts the iframe and never drops
 * the participant out of the lesson.
 */
export function LessonCallProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [call, setCall] = useState<ActiveLessonCall | null>(null);
  const [joined, setJoined] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  // One join/leave pair per conference; the server owns the timestamps.
  const cycleRef = useRef<{
    lessonId: string;
    room: string;
    deviceId: string;
  } | null>(null);

  const sendBeat = useCallback(
    (
      lessonId: string,
      action: "join" | "leave",
      deviceId: string,
      keepalive = false
    ) => {
      void sendAttendanceEvent(
        lessonId,
        {
          action,
          deviceId,
          eventId: newEventId(action),
          clientAt: new Date().toISOString(),
        },
        { keepalive }
      ).catch(() => {
        // Attendance tracking is best-effort; it must never break the call.
      });
    },
    []
  );

  const leaveCycle = useCallback(
    (keepalive = false) => {
      const cycle = cycleRef.current;
      if (!cycle) return;
      cycleRef.current = null;
      sendBeat(cycle.lessonId, "leave", cycle.deviceId, keepalive);
    },
    [sendBeat]
  );

  const startCall = useCallback((next: ActiveLessonCall) => {
    // Same room: keep the existing conference (and its identity) untouched.
    setCall((current) => (current?.room === next.room ? current : next));
  }, []);

  const endCall = useCallback(() => {
    setCall(null);
    setJoined(false);
    setMinimized(false);
  }, []);

  const activeRoom = call?.room ?? null;
  useEffect(() => {
    if (!activeRoom) return;
    // Switching rooms disposes the previous conference without a leave event.
    if (cycleRef.current && cycleRef.current.room !== activeRoom) {
      leaveCycle();
    }
    setMinimized(false);
    setJoined(false);
  }, [activeRoom, leaveCycle]);

  const handleJoined = useCallback(() => {
    setJoined(true);
    if (!call?.trackAttendance) return;
    const deviceId = getDeviceId();
    cycleRef.current = {
      lessonId: call.lessonId,
      room: call.room,
      deviceId,
    };
    sendBeat(call.lessonId, "join", deviceId);
  }, [call, sendBeat]);

  // A closed tab never emits videoConferenceLeft; keepalive still records it.
  useEffect(() => {
    if (!call?.trackAttendance) return;
    const onHide = () => leaveCycle(true);
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [call, leaveCycle]);

  const endAndReturn = useCallback(() => {
    if (!call) return;
    const { lessonId: endedLessonId, backHref } = call;
    const shouldReturn = pathname === `/lesson/${endedLessonId}`;
    leaveCycle();
    endCall();
    if (shouldReturn) router.push(backHref);
  }, [call, endCall, leaveCycle, pathname, router]);

  const value = useMemo(
    () => ({ call, startCall, endCall, minimized, setMinimized }),
    [call, startCall, endCall, minimized]
  );

  return (
    <LessonCallContext.Provider value={value}>
      {children}
      {call && (
        <LessonCallHost
          call={call}
          joined={joined}
          minimized={minimized}
          onMinimize={() => setMinimized(true)}
          onExpand={() => setMinimized(false)}
          onJoined={handleJoined}
          onLeft={() => leaveCycle()}
          onHangup={endAndReturn}
        />
      )}
    </LessonCallContext.Provider>
  );
}

function LessonCallHost({
  call,
  joined,
  minimized,
  onMinimize,
  onExpand,
  onJoined,
  onLeft,
  onHangup,
}: {
  call: ActiveLessonCall;
  joined: boolean;
  minimized: boolean;
  onMinimize: () => void;
  onExpand: () => void;
  onJoined: () => void;
  onLeft: () => void;
  onHangup: () => void;
}) {
  const pathname = usePathname();
  const expanded = pathname === `/lesson/${call.lessonId}` && !minimized;
  // An unjoined call has no session to keep visible, so it stays mounted but
  // off-screen if the visitor leaves the lesson page before joining.
  const showMini = !expanded && joined;

  const apiRef = useRef<JitsiExternalApi | null>(null);
  const [pipSupported, setPipSupported] = useState(false);
  const [pipActive, setPipActive] = useState(false);
  const [penActive, setPenActive] = useState(false);
  const wasExpanded = useRef(expanded);
  const { role } = useAuth();
  // The server enforces the same rule; this only decides who sees the button.
  const canMark =
    role === "teacher" || role === "admin" || role === "super_admin";

  // Marking takes over the pointer, so leaving the full room must drop it.
  useEffect(() => {
    if (!expanded) setPenActive(false);
  }, [expanded, call.lessonId]);

  useEffect(() => {
    setPipSupported(
      "documentPictureInPicture" in window ||
        Boolean(document.pictureInPictureEnabled)
    );
  }, []);

  const { connection, revision } = useRealtimeConnection();
  const [share, setShare] = useState<{ holder: string | null; local: boolean }>(
    { holder: null, local: false }
  );
  // The Jitsi listeners are registered once per conference, so they read the
  // current lesson and socket through refs instead of closing over them.
  const lessonIdRef = useRef(call.lessonId);
  const connectionRef = useRef(connection);
  lessonIdRef.current = call.lessonId;
  connectionRef.current = connection;

  const handleShareStatus = useCallback((event: unknown) => {
    const on = Boolean((event as { on?: boolean } | null)?.on);
    const currentConnection = connectionRef.current;
    const lessonId = lessonIdRef.current;
    setShare((current) => ({ ...current, local: on }));
    // With no live socket the lock cannot be consulted, so sharing still works.
    if (!currentConnection || !lessonId) return;

    if (!on) {
      void currentConnection
        .invoke("ReleaseLessonShare", lessonId)
        .catch(() => {});
      return;
    }

    void currentConnection
      .invoke<ShareClaim>("ClaimLessonShare", lessonId)
      .then((claim) => {
        if (claim?.accepted) {
          setShare((current) => ({ ...current, holder: null }));
          return;
        }
        setShare({
          holder: claim?.holder ?? "Another participant",
          local: true,
        });
        // The lesson allows one screen at a time, so this share cannot stay.
        apiRef.current?.executeCommand("toggleShareScreen");
      })
      .catch(() => {});
  }, []);

  // Follow the lock for as long as this call is up, and hand it back on the way
  // out so hanging up mid-share never leaves the other person blocked.
  useEffect(() => {
    if (!joined || !connection) return;
    let disposed = false;
    setShare({ holder: null, local: false });

    const onChanged = (state: ShareState) =>
      setShare((current) => ({
        ...current,
        holder: state?.on ? (state.holder ?? "Another participant") : null,
      }));

    connection.on("LessonShareChanged", onChanged);
    void connection
      .invoke<ShareState>("JoinLessonShare", call.lessonId)
      .then((state) => {
        if (!disposed && state?.on) {
          setShare((current) => ({
            ...current,
            holder: state.holder ?? "Another participant",
          }));
        }
      })
      .catch(() => {});

    return () => {
      disposed = true;
      connection.off("LessonShareChanged", onChanged);
      void connection
        .invoke("ReleaseLessonShare", call.lessonId)
        .catch(() => {});
      void connection.invoke("LeaveLessonShare", call.lessonId).catch(() => {});
    };
  }, [connection, revision, joined, call.lessonId]);

  const handleApiReady = useCallback(
    (api: JitsiExternalApi | null) => {
      apiRef.current = api;
      setPipActive(false);
      if (!api) return;
      api.addListener("pipEntered", () => setPipActive(true));
      api.addListener("pipLeft", () => setPipActive(false));
      api.addListener("screenSharingStatusChanged", handleShareStatus);
    },
    [handleShareStatus]
  );

  const togglePip = () => {
    apiRef.current?.executeCommand(pipActive ? "hidePiP" : "showPiP");
  };

  // A click that leaves the room page is also the browser gesture needed to
  // open the floating window, so the lesson stays visible while browsing.
  useEffect(() => {
    if (!pipSupported || !joined || !expanded) return;
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      const href = anchor?.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith(`/lesson/${call.lessonId}`)
      ) {
        return;
      }
      apiRef.current?.executeCommand("showPiP");
    };
    document.addEventListener("click", onClick, { capture: true });
    return () =>
      document.removeEventListener("click", onClick, { capture: true });
  }, [pipSupported, joined, expanded, call.lessonId]);

  // Returning to the full room makes the floating preview redundant.
  useEffect(() => {
    if (expanded && !wasExpanded.current) {
      apiRef.current?.executeCommand("hidePiP");
    }
    wasExpanded.current = expanded;
  }, [expanded]);

  return (
    <div
      className={
        expanded
          ? "fixed inset-0 z-[70] flex flex-col bg-black"
          : showMini
            ? "fixed bottom-4 right-4 z-[70] flex w-[min(400px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl"
            : "fixed inset-0 z-[70] hidden"
      }
    >
      <div
        className={
          showMini || expanded
            ? "flex items-center justify-between gap-2 bg-neutral-900 px-3 py-2 text-white"
            : "hidden"
        }
      >
        <span className="truncate text-xs font-semibold">
          Lesson in progress
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {expanded && canMark && (
            <button
              type="button"
              onClick={() => setPenActive((value) => !value)}
              aria-label={
                penActive ? "Stop marking the screen" : "Mark on the screen"
              }
              aria-pressed={penActive}
              title={
                penActive
                  ? "Stop marking"
                  : "Mark words on the shared screen for your student"
              }
              className={`rounded-lg p-1.5 transition ${
                penActive
                  ? "bg-amber-400 text-black hover:bg-amber-300"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <PenLine size={14} />
            </button>
          )}
          {!expanded && (
            <Link
              href={`/lesson/${call.lessonId}`}
              onClick={onExpand}
              className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold transition hover:bg-white/20"
            >
              Open
            </Link>
          )}
          {expanded && (
            <button
              type="button"
              onClick={onMinimize}
              aria-label="Minimize lesson"
              className="rounded-lg bg-white/10 p-1.5 transition hover:bg-white/20"
            >
              <Minimize2 size={14} />
            </button>
          )}
          {pipSupported && (
            <button
              type="button"
              onClick={togglePip}
              aria-label={
                pipActive ? "Return video to this page" : "Pop out video"
              }
              title={
                pipActive
                  ? "Return video to this page"
                  : "Pop out video to keep it visible on other tabs and windows"
              }
              className={`rounded-lg p-1.5 transition ${
                pipActive
                  ? "bg-green-500/90 hover:bg-green-500"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <PictureInPicture2 size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={onHangup}
            aria-label="Leave lesson"
            className="rounded-lg bg-red-500/90 p-1.5 transition hover:bg-red-500"
          >
            <PhoneOff size={14} />
          </button>
        </div>
      </div>

      <div
        className={
          expanded ? "relative min-h-0 flex-1" : "relative aspect-video w-full"
        }
      >
        <JitsiRoom
          domain={call.domain}
          room={call.room}
          displayName={call.displayName}
          onClose={onHangup}
          onJoined={onJoined}
          onLeft={onLeft}
          onApiReady={handleApiReady}
        />
        <img
          src="/logo-ana-quran.svg?v=2026-11-06-1"
          alt="Ana Quran"
          className={`pointer-events-none absolute left-3 top-3 z-10 w-auto drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)] ${
            expanded ? "h-12 sm:h-16" : "h-8"
          } ${penActive && expanded ? "hidden" : ""}`}
        />
        {expanded && (
          <LessonPenOverlay
            lessonId={call.lessonId}
            active={penActive}
            canDraw={canMark}
            onDone={() => setPenActive(false)}
          />
        )}
        {share.holder && !share.local && (
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-none absolute inset-x-0 bottom-20 z-20 flex justify-center px-3"
          >
            <p className="max-w-lg rounded-xl bg-neutral-900/90 px-4 py-2 text-center text-xs font-medium text-white shadow-lg sm:text-sm">
              {share.holder} is sharing their screen. Only one screen share at a
              time — you can share once they stop.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
