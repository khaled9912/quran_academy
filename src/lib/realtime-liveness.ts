/**
 * Whether the SignalR socket is currently live.
 *
 * REST polling exists only to repair missed change events, and the socket
 * already delivers those: every scope invalidates its queries, and connecting,
 * reconnecting, regaining focus or regaining network runs a full sweep. Paying
 * for a fixed cadence while the socket is healthy means an idle tab still wakes
 * the database every 20 seconds, which keeps Neon from ever scaling to zero.
 *
 * The realtime provider writes this; `socketAwareInterval` reads it.
 */
let live = false;

export const setRealtimeLive = (value: boolean) => {
  live = value;
};

export const isRealtimeLive = () => live;

/**
 * Poll at `ms` only while the socket is down.
 *
 * React Query re-reads this whenever a query settles, and the provider sweeps
 * every query on both transitions, so an interval arms on disconnect and
 * disarms on connect. Detection is bounded: SignalR's own keepalive turns a
 * silent TCP blackhole into `onclose` within about 30 seconds.
 */
export const socketAwareInterval =
  (ms: number) =>
  (): number | false => (live ? false : ms);
