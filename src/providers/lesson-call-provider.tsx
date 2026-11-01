"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Minimize2, PhoneOff } from "lucide-react";
import { JitsiRoom } from "@/components/JitsiRoom";

export interface ActiveLessonCall {
  lessonId: string;
  room: string;
  domain: string;
  displayName: string;
  backHref: string;
}

interface LessonCallContextValue {
  call: ActiveLessonCall | null;
  startCall: (call: ActiveLessonCall) => void;
  endCall: () => void;
  minimized: boolean;
  setMinimized: (minimized: boolean) => void;
}

const LessonCallContext = createContext<LessonCallContextValue | null>(null);

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
    setMinimized(false);
    setJoined(false);
  }, [activeRoom]);

  const endAndReturn = useCallback(() => {
    if (!call) return;
    const { lessonId: endedLessonId, backHref } = call;
    const shouldReturn = pathname === `/lesson/${endedLessonId}`;
    endCall();
    if (shouldReturn) router.push(backHref);
  }, [call, endCall, pathname, router]);

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
          onJoined={() => setJoined(true)}
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
  onHangup,
}: {
  call: ActiveLessonCall;
  joined: boolean;
  minimized: boolean;
  onMinimize: () => void;
  onExpand: () => void;
  onJoined: () => void;
  onHangup: () => void;
}) {
  const pathname = usePathname();
  const expanded = pathname === `/lesson/${call.lessonId}` && !minimized;
  // An unjoined call has no session to keep visible, so it stays mounted but
  // off-screen if the visitor leaves the lesson page before joining.
  const showMini = !expanded && joined;

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
        />
        <img
          src="/logo-ana-quran.svg"
          alt="Ana Quran"
          className={`pointer-events-none absolute left-3 top-3 z-10 w-auto drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)] ${
            expanded ? "h-12 sm:h-16" : "h-8"
          }`}
        />
      </div>
    </div>
  );
}
