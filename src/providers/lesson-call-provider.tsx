"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Minimize2, PenLine, PhoneOff } from "lucide-react";
import { JitsiRoom } from "@/components/JitsiRoom";
import { LeaveLessonDialog } from "@/components/lesson/LeaveLessonDialog";
import { LessonPenOverlay } from "@/components/lesson/LessonPenOverlay";
import {
  SelfTranscriptionConsent,
  SelfTranscriptionControls,
} from "@/components/lesson/SelfTranscriptionControls";
import { StudentConcernReport } from "@/components/lesson/StudentConcernReport";
import { useSelfTranscription } from "@/hooks/use-self-transcription";
import { useAuth } from "@/providers/auth-provider";
import { useRealtimeConnection } from "@/providers/realtime-provider";
import { useLessonRoomFlags } from "@/hooks/use-lesson-room-flags";
import { sendAttendanceEvent } from "@/services/lesson.service";
import type { LessonRoomFlags } from "@/services/lesson-room-config.service";
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

/**
 * How long to wait for the room to report that it left before tearing the
 * player down anyway. The leave presence itself is sent in well under a second.
 */
const LEAVE_GRACE_MS = 2000;

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
  // Loaded with the app so a room opened later never has to wait on it: the
  // flags decide the Jitsi toolbar, which is fixed once the conference exists.
  // The refresh loop only runs while a room is open, so a tab that is merely
  // sitting on a dashboard asks the server nothing.
  const { flags, flagsLoaded, captureValidUntil } =
    useLessonRoomFlags(Boolean(call));
  const stopCaptureRef = useRef<((flush?: boolean) => void) | null>(null);
  const callRef = useRef(call);
  callRef.current = call;
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
    const current = callRef.current;
    if (
      current?.room === next.room &&
      current.domain === next.domain &&
      current.lessonId === next.lessonId
    )
      return;
    stopCaptureRef.current?.(true);
    setCall(next);
  }, []);

  const endCall = useCallback(() => {
    stopCaptureRef.current?.(true);
    setCall(null);
    setJoined(false);
    setMinimized(false);
  }, []);

  // The live conference, shared with the host so the leave control can hang up
  // inside the room before the player comes down.
  const apiRef = useRef<JitsiExternalApi | null>(null);
  // Where to go once the room confirms it left, and the timer that stops
  // waiting if the event never arrives.
  const pendingReturnRef = useRef<{
    backHref: string;
    navigate: boolean;
  } | null>(null);
  const returnTimerRef = useRef<number | null>(null);

  const finishPendingReturn = useCallback(() => {
    if (returnTimerRef.current !== null) {
      window.clearTimeout(returnTimerRef.current);
      returnTimerRef.current = null;
    }
    const pending = pendingReturnRef.current;
    if (!pending) return;
    pendingReturnRef.current = null;
    endCall();
    if (pending.navigate) router.push(pending.backHref);
  }, [endCall, router]);

  useEffect(() => () => finishPendingReturn(), [finishPendingReturn]);

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

  // The room can also leave by itself — the hangup above, a kick, or a
  // dropped connection — and any of those completes a return in flight.
  const handleLeft = useCallback(() => {
    stopCaptureRef.current?.(true);
    setJoined(false);
    leaveCycle();
    finishPendingReturn();
  }, [leaveCycle, finishPendingReturn]);

  const endAndReturn = useCallback(() => {
    if (!call || pendingReturnRef.current) return;
    stopCaptureRef.current?.(true);
    const navigate = pathname === `/lesson/${call.lessonId}`;
    leaveCycle();

    // Before the room was joined there is no conference to leave, and taking
    // the player down is enough.
    if (!joined) {
      endCall();
      if (navigate) router.push(call.backHref);
      return;
    }

    // Removing the iframe is not leaving: the server only notices a dead
    // connection about a minute later, so everyone keeps seeing this
    // participant's tile until then. Hanging up inside the room sends the
    // proper departure and the tile disappears at once.
    pendingReturnRef.current = { backHref: call.backHref, navigate };
    apiRef.current?.executeCommand("hangup");
    returnTimerRef.current = window.setTimeout(
      finishPendingReturn,
      LEAVE_GRACE_MS
    );
  }, [
    call,
    endCall,
    finishPendingReturn,
    joined,
    leaveCycle,
    pathname,
    router,
  ]);

  // Every leave control asks first: these buttons sit next to the ones used
  // during the lesson, so an accidental press should not drop the call.
  const [leavePending, setLeavePending] = useState(false);
  useEffect(() => {
    if (!call) setLeavePending(false);
  }, [call]);

  const value = useMemo(
    () => ({ call, startCall, endCall, minimized, setMinimized }),
    [call, startCall, endCall, minimized]
  );

  return (
    <LessonCallContext.Provider value={value}>
      {children}
      {call && flagsLoaded && (
        <LessonCallHost
          key={`${call.lessonId}:${call.domain}:${call.room}`}
          call={call}
          flags={flags}
          captureValidUntil={captureValidUntil}
          stopCaptureRef={stopCaptureRef}
          joined={joined}
          minimized={minimized}
          apiRef={apiRef}
          onMinimize={() => setMinimized(true)}
          onExpand={() => setMinimized(false)}
          onJoined={handleJoined}
          onLeft={handleLeft}
          onHangup={endAndReturn}
          onRequestLeave={() => {
            // Nothing has been joined yet, so there is no lesson to drop.
            if (joined) setLeavePending(true);
            else endAndReturn();
          }}
        />
      )}
      <LeaveLessonDialog
        open={leavePending}
        onCancel={() => setLeavePending(false)}
        onConfirm={() => {
          setLeavePending(false);
          endAndReturn();
        }}
      />
    </LessonCallContext.Provider>
  );
}

function LessonCallHost({
  call,
  flags,
  captureValidUntil,
  stopCaptureRef,
  joined,
  minimized,
  apiRef,
  onMinimize,
  onExpand,
  onJoined,
  onLeft,
  onHangup,
  onRequestLeave,
}: {
  call: ActiveLessonCall;
  flags: LessonRoomFlags;
  captureValidUntil: number;
  stopCaptureRef: MutableRefObject<((flush?: boolean) => void) | null>;
  joined: boolean;
  minimized: boolean;
  apiRef: MutableRefObject<JitsiExternalApi | null>;
  onMinimize: () => void;
  onExpand: () => void;
  onJoined: () => void;
  onLeft: () => void;
  onHangup: () => void;
  onRequestLeave: () => void;
}) {
  const pathname = usePathname();
  const expanded = pathname === `/lesson/${call.lessonId}` && !minimized;
  // An unjoined call has no session to keep visible, so it stays mounted but
  // off-screen if the visitor leaves the lesson page before joining.
  const showMini = !expanded && joined;

  const [pipSupported, setPipSupported] = useState(false);
  const [penActive, setPenActive] = useState(false);
  const wasExpanded = useRef(expanded);
  const { role, user, isAuthenticated } = useAuth();
  const participant = Boolean(
    call.trackAttendance &&
      isAuthenticated &&
      (role === "student" || role === "teacher")
  );
  const transcription = useSelfTranscription({
    lessonId: call.lessonId,
    userId: user?.id,
    participant,
    enabled: flags.transcription,
    validUntil: captureValidUntil,
  });
  const {
    stop: stopTranscription,
    onApiReady: onTranscriptionApi,
    onJoined: onTranscriptionJoined,
  } = transcription;
  useLayoutEffect(() => {
    stopCaptureRef.current = stopTranscription;
    return () => {
      stopCaptureRef.current = null;
    };
  }, [stopCaptureRef, stopTranscription]);
  const handleJoined = useCallback(() => {
    onTranscriptionJoined();
    onJoined();
  }, [onTranscriptionJoined, onJoined]);

  // The server enforces the same rule; this only decides who sees the button.
  // Marking is also a switch: no flag, no pen and no ink layer to poll.
  const canMark =
    flags.pen &&
    (role === "teacher" || role === "admin" || role === "super_admin");

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
      apiRef.current?.removeListener(
        "screenSharingStatusChanged",
        handleShareStatus
      );
      apiRef.current = api;
      onTranscriptionApi(api);
      if (!api) return;
      api.addListener("screenSharingStatusChanged", handleShareStatus);
    },
    [apiRef, handleShareStatus, onTranscriptionApi]
  );

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
          {/* The mini player has no room of its own, so it keeps the only
              leave control outside the full room. */}
          {!expanded && (
            <button
              type="button"
              onClick={onRequestLeave}
              aria-label="Leave lesson"
              className="rounded-lg bg-red-500/90 p-1.5 transition hover:bg-red-500"
            >
              <PhoneOff size={14} />
            </button>
          )}
        </div>
      </div>

      {joined &&
        participant &&
        flags.transcription &&
        (expanded || transcription.consent) && (
          <SelfTranscriptionControls
            enabled={flags.transcription}
            consent={transcription.consent}
            supported={transcription.supported}
            state={transcription.state}
            onConsent={transcription.setConsent}
          />
        )}
      {flags.reportConcern &&
        isAuthenticated &&
        role === "student" &&
        call.trackAttendance && (
          <div className={expanded ? undefined : "hidden"}>
            <StudentConcernReport
              key={`${call.lessonId}:${user?.id}`}
              lessonId={call.lessonId}
            />
          </div>
        )}

      <div
        className={
          expanded
            ? "relative min-h-0 flex-1"
            : "relative aspect-video w-full shrink-0"
        }
      >
        <JitsiRoom
          domain={call.domain}
          room={call.room}
          displayName={call.displayName}
          flags={flags}
          transcriptionConsent={
            participant && flags.transcription ? (
              <SelfTranscriptionConsent
                consent={transcription.consent}
                supported={transcription.supported}
                onChange={transcription.setConsent}
              />
            ) : null
          }
          onClose={onHangup}
          onJoined={handleJoined}
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
        {expanded && !penActive && (
          // The room's own leave control. It sits above the toolbar row the
          // iframe draws, so it never covers the mic or chat buttons.
          <button
            type="button"
            onClick={onRequestLeave}
            aria-label="Leave lesson"
            className="absolute bottom-20 right-3 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-500/95 text-white shadow-lg transition hover:bg-red-500"
          >
            <PhoneOff size={18} />
          </button>
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
