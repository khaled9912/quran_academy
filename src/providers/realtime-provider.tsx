"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  LogLevel,
} from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { backendFetch } from "@/lib/backend-client";
import { setRealtimeLive } from "@/lib/realtime-liveness";
import { useAuth } from "@/providers/auth-provider";

/**
 * The hub only says which data changed; REST remains the source of truth.
 * Each scope maps to the query-key prefixes it can invalidate, so a lesson
 * update never refetches billing data.
 */
const SCOPE_QUERY_KEYS: Record<string, string[][]> = {
  lessons: [
    ["lessons"],
    ["series"],
    ["change-requests"],
    ["lesson-ops"],
    ["admin-lesson-ops"],
    ["admin-lesson-ops-detail"],
    ["profile", "reports"],
    ["student", "credits"],
    ["teacher-profile"],
  ],
  admin: [
    ["lessons"],
    ["change-requests"],
    ["admin-lesson-ops"],
    ["admin-lesson-ops-detail"],
    ["admin-excuses"],
    ["admin-incidents"],
    ["admin-hours"],
    ["admin-salary"],
    ["admin-penalties"],
    ["admin-reliability"],
    ["teacher-applications"],
    ["contact-submissions"],
  ],
  directory: [
    ["teachers"],
    ["students"],
    ["teacher-student-assignments"],
    ["availability"],
    ["availability-rules"],
    ["teacher-profile"],
    ["series"],
    ["support-users"],
  ],
  offers: [["open-offers"], ["availability"], ["teachers"]],
  billing: [
    ["billing"],
    ["admin-salary"],
    ["admin-hours"],
    ["admin-penalties"],
  ],
  policy: [["lesson-policy"]],
  notifications: [["notifications"]],
  calls: [["lesson-calls"], ["lesson-ops"]],
  support: [
    ["review-queue"],
    ["review-workspace"],
    ["review-digest"],
    ["flagged-lessons"],
    ["lesson-transcript"],
  ],
};

const TICKET_REFRESH_MARGIN_MS = 30_000;
// A single action can publish several events (lesson + notifications + admin);
// one refetch per changed key is enough.
const INVALIDATE_DEBOUNCE_MS = 250;

type RealtimeTicket = { token: string; expiresAt: string; hub: string };
type ChangedEvent = { scope?: string };

interface RealtimeConnectionValue {
  /** Null while the socket is down; consumers can safely wait for it. */
  connection: HubConnection | null;
  /** Bumped on every successful (re)connect so consumers can re-subscribe. */
  revision: number;
}

const RealtimeConnectionContext = createContext<RealtimeConnectionValue>({
  connection: null,
  revision: 0,
});

/**
 * Escape hatch for features that need the live socket itself (lesson pens).
 * Query invalidation still belongs to the provider; nothing else should join
 * groups or listen to hub events from UI code without a reason.
 */
export const useRealtimeConnection = () =>
  useContext(RealtimeConnectionContext);

const resolveHubUrl = (ticket: RealtimeTicket) => {
  const override = (process.env.NEXT_PUBLIC_REALTIME_URL ?? "")
    .trim()
    .replace(/\/+$/, "");
  if (!override) return ticket.hub;
  return override.endsWith("/api/realtime/hub")
    ? override
    : `${override}/api/realtime/hub`;
};

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const ticketRef = useRef<RealtimeTicket | null>(null);
  const [liveConnection, setLiveConnection] = useState<HubConnection | null>(
    null
  );
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    // A cached ticket belongs to the session that requested it.
    ticketRef.current = null;
    setRealtimeLive(false);
    setLiveConnection(null);
    let stopped = false;
    let connection: HubConnection | null = null;
    let retryTimer: number | undefined;
    let retryAttempts = 0;
    let pendingScopes = new Set<string>();
    let flushTimer: number | undefined;

    const fetchTicket = async (): Promise<RealtimeTicket> => {
      const cached = ticketRef.current;
      if (
        cached &&
        Date.parse(cached.expiresAt) - Date.now() > TICKET_REFRESH_MARGIN_MS
      ) {
        return cached;
      }
      // The ticket is short-lived and only read during the handshake, so an
      // established socket survives its expiry; a reconnect fetches a new one.
      const next = await backendFetch<RealtimeTicket>("/api/realtime/ticket");
      ticketRef.current = next;
      return next;
    };

    const invalidateScope = (scope: string) => {
      const keys = SCOPE_QUERY_KEYS[scope];
      if (!keys) {
        // Unknown events must not leave stale screens behind.
        void queryClient.invalidateQueries();
        return;
      }
      for (const key of keys)
        void queryClient.invalidateQueries({ queryKey: key });
    };

    const flushScopes = () => {
      flushTimer = undefined;
      const scopes = pendingScopes;
      pendingScopes = new Set();
      for (const scope of scopes) invalidateScope(scope);
    };

    const onChanged = (change: ChangedEvent) => {
      const scope = (change?.scope ?? "").trim();
      if (!scope || scope === "self") return;
      pendingScopes.add(scope);
      if (flushTimer === undefined) {
        flushTimer = window.setTimeout(flushScopes, INVALIDATE_DEBOUNCE_MS);
      }
    };

    const scheduleRetry = () => {
      if (stopped || retryTimer !== undefined) return;
      retryAttempts += 1;
      const delay = Math.min(60_000, 1_000 * 2 ** Math.min(retryAttempts, 6));
      retryTimer = window.setTimeout(() => {
        retryTimer = undefined;
        void start();
      }, delay);
    };

    const start = async () => {
      if (stopped || connection) return;
      try {
        const ticket = await fetchTicket();
        if (stopped) return;
        const next = new HubConnectionBuilder()
          .withUrl(resolveHubUrl(ticket), {
            accessTokenFactory: async () => (await fetchTicket()).token,
            // Direct WebSocket upgrade: the FE rewrite does not proxy upgrades.
            skipNegotiation: true,
            transport: HttpTransportType.WebSockets,
          })
          .withAutomaticReconnect([0, 2_000, 5_000, 10_000, 20_000])
          .configureLogging(
            process.env.NODE_ENV === "production"
              ? LogLevel.Error
              : LogLevel.Warning
          )
          .build();
        next.on("Changed", onChanged);
        next.onreconnected(() => {
          retryAttempts = 0;
          // Events published while offline are gone; refetch everything.
          void queryClient.invalidateQueries();
          setRevision((value) => value + 1);
        });
        next.onclose(() => {
          connection = null;
          setLiveConnection(null);
          // Polling is suspended while the socket is live, so this sweep is
          // also what re-arms every interval now that it is not.
          setRealtimeLive(false);
          void queryClient.invalidateQueries();
          scheduleRetry();
        });
        await next.start();
        if (stopped) {
          await next.stop();
          return;
        }
        connection = next;
        retryAttempts = 0;
        setRealtimeLive(true);
        setLiveConnection(next);
        setRevision((value) => value + 1);
      } catch {
        scheduleRetry();
      }
    };

    const handleOnline = () => {
      if (connection) void queryClient.invalidateQueries();
      else void start();
    };

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      if (connection?.state === HubConnectionState.Disconnected) void start();
      void queryClient.invalidateQueries();
    };

    void start();
    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stopped = true;
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
      if (flushTimer !== undefined) window.clearTimeout(flushTimer);
      const current = connection;
      connection = null;
      setRealtimeLive(false);
      setLiveConnection(null);
      if (current) void current.stop();
    };
  }, [isAuthenticated, queryClient]);

  const connectionValue = useMemo(
    () => ({ connection: liveConnection, revision }),
    [liveConnection, revision]
  );

  return (
    <RealtimeConnectionContext.Provider value={connectionValue}>
      {children}
    </RealtimeConnectionContext.Provider>
  );
}
