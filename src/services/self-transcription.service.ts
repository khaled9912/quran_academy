import type { JitsiExternalApi } from "../types/jitsi";

export type TranscriptStatus =
  | "started"
  | "muted"
  | "unsupported"
  | "denied"
  | "stopped"
  | "error";
export type CaptureState =
  | "waiting"
  | "starting"
  | "listening"
  | "muted"
  | "retrying"
  | "denied"
  | "stopped"
  | "error"
  | "blocked";
export type SelfSegment = { id: string; text: string; atSeconds?: number };
export type SelfTranscriptBody = {
  segments: SelfSegment[];
  status: TranscriptStatus;
};
export type TranscriptSender = (
  body: SelfTranscriptBody,
  options: { keepalive: boolean; signal: AbortSignal }
) => Promise<{ accepted: number }>;

// Deliberately local types: browsers expose different prefixed speech APIs.
export interface SpeechEngine {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult:
    | ((event: {
        resultIndex: number;
        results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
      }) => void)
    | null;
  start(): void;
  abort(): void;
}
export type SpeechConstructor = new () => SpeechEngine;
export type SpeechWindow = {
  SpeechRecognition?: SpeechConstructor;
  webkitSpeechRecognition?: SpeechConstructor;
  matchMedia: (query: string) => { matches: boolean };
  navigator: { userAgent: string; platform: string; maxTouchPoints: number };
};

export function desktopSpeechConstructor(
  env: SpeechWindow
): SpeechConstructor | null {
  const { userAgent, platform, maxTouchPoints } = env.navigator;
  if (
    /android|iphone|ipad|ipod|mobile|tablet/i.test(userAgent) ||
    (platform === "MacIntel" && maxTouchPoints > 1) ||
    env.matchMedia("(any-pointer: coarse)").matches ||
    env.matchMedia("(pointer: coarse)").matches
  )
    return null;
  return env.SpeechRecognition ?? env.webkitSpeechRecognition ?? null;
}

export class LessonLightError extends Error {
  status: number;
  constructor(status: number) {
    super("Lesson request failed.");
    this.status = status;
  }
}

/** Never surface/log a response body: it can contain submitted private text. */
export async function postLessonLight<T>(
  lessonId: string,
  suffix: "transcript/self" | "incident",
  body: unknown,
  options: { signal?: AbortSignal; keepalive?: boolean } = {}
): Promise<T> {
  const base = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").replace(/\/$/, "");
  if (!base) throw new LessonLightError(0);
  const signal = options.signal
    ? AbortSignal.any([options.signal, AbortSignal.timeout(10_000)])
    : AbortSignal.timeout(10_000);
  const response = await fetch(
    `${base}/api/lessons/${encodeURIComponent(lessonId)}/${suffix}`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal,
      keepalive: options.keepalive ?? false,
    }
  );
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("academy:unauthorized"));
    }
    throw new LessonLightError(response.status);
  }
  return response.status === 204 ? (null as T) : response.json();
}

export const MAX_BATCH_BYTES = 48 * 1024;
const MAX_QUEUE = 100;
const MAX_SEGMENTS = 5000;
// Shared across room/consent changes in this tab. Other tabs remain server-limited.
const sendTimes: number[] = [];

export function splitFinalText(
  text: string,
  atSeconds: number,
  uuid: () => string = () => crypto.randomUUID()
): SelfSegment[] {
  const chunks: SelfSegment[] = [];
  // Bound work for a pathological provider result before allocating a queue.
  let remaining = text.trim().slice(0, MAX_QUEUE * 1000);
  while (remaining.length) {
    let end = Math.min(1000, remaining.length);
    const last = remaining.charCodeAt(end - 1);
    if (last >= 0xd800 && last <= 0xdbff) end--;
    if (!end) break;
    const chunk = remaining.slice(0, end).trim();
    remaining = remaining.slice(end);
    if (chunk)
      chunks.push({
        id: uuid(),
        text: chunk,
        atSeconds: Math.max(0, Number.isFinite(atSeconds) ? atSeconds : 0),
      });
  }
  return chunks;
}

export function boundedBatch(
  queue: SelfSegment[],
  status: TranscriptStatus
): SelfTranscriptBody {
  const segments: SelfSegment[] = [];
  for (const segment of queue.slice(0, 20)) {
    const candidate = { segments: [...segments, segment], status };
    if (
      new TextEncoder().encode(JSON.stringify(candidate)).byteLength >
      MAX_BATCH_BYTES
    )
      break;
    segments.push(segment);
  }
  return { segments, status };
}

/** Memory-only, serial, byte-bounded uploads. Retries retain the same IDs. */
export class SelfTranscriptUploader {
  private send: TranscriptSender;
  private permitted: () => boolean;
  private health: (state: "ok" | "retrying" | "halted") => void;
  private queue: SelfSegment[] = [];
  private total = 0;
  private status: TranscriptStatus = "stopped";
  private revision = 0;
  private dirty = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private timerDue = 0;
  private request: AbortController | null = null;
  private inFlight = false;
  private epoch = 0;
  private attempts = 0;
  private retryBody: SelfTranscriptBody | null = null;
  private retryRevision = 0;
  private notBefore = 0;
  private paused = false;
  private terminal = false;
  private closing = false;
  private finalSent = false;

  constructor(
    send: TranscriptSender,
    permitted: () => boolean,
    health: (state: "ok" | "retrying" | "halted") => void
  ) {
    this.send = send;
    this.permitted = permitted;
    this.health = health;
  }

  setStatus(status: TranscriptStatus) {
    if (this.terminal || this.closing) return;
    if (this.status === status && this.revision) return;
    this.status = status;
    this.revision++;
    this.dirty = true;
    this.schedule(0);
  }

  enqueue(segments: SelfSegment[]) {
    if (this.terminal || this.closing || this.paused || !segments.length)
      return;
    if (
      this.queue.length + segments.length > MAX_QUEUE ||
      this.total + segments.length > MAX_SEGMENTS
    ) {
      this.halt();
      return;
    }
    this.queue.push(...segments);
    this.total += segments.length;
    this.schedule(this.queue.length >= 20 ? 0 : 15_000);
  }

  private schedule(delay: number) {
    if (this.inFlight || this.terminal || this.paused) return;
    const due = Date.now() + delay;
    if (this.timer !== null && this.timerDue <= due) return;
    this.clearTimer();
    this.timerDue = due;
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, delay);
  }

  private clearTimer() {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }

  pause() {
    this.paused = true;
    this.epoch++;
    this.clearTimer();
    this.request?.abort();
    this.queue = [];
    this.retryBody = null;
    this.dirty = false;
    this.revision = 0;
    this.attempts = 0;
  }

  resume() {
    if (!this.terminal && !this.closing && this.paused) {
      this.paused = false;
      if (this.dirty) this.schedule(0);
    }
  }

  private halt() {
    this.terminal = true;
    this.pause();
    this.health("halted");
  }

  close(flush: boolean) {
    if (this.closing) return;
    if (!flush || !this.permitted() || this.terminal) {
      this.pause();
      this.closing = true;
      return;
    }
    this.setStatus("stopped");
    this.closing = true;
    this.clearTimer();
    // If a request is in flight, its finally block performs at most one final
    // keepalive batch. Never overlap it, even during leave/pagehide.
    void this.flush();
  }

  async flush() {
    if (
      this.inFlight ||
      this.terminal ||
      this.paused ||
      (this.closing && this.finalSent)
    )
      return;
    if (!this.permitted()) {
      this.pause();
      return;
    }
    if (!this.dirty && !this.queue.length && !this.retryBody) return;
    const now = Date.now();
    while (sendTimes.length && sendTimes[0] <= now - 60_000) sendTimes.shift();
    const wait = Math.max(
      0,
      (sendTimes.at(-1) ?? 0) + 2500 - now,
      sendTimes.length >= 24 ? sendTimes[0] + 60_000 - now : 0,
      this.notBefore - now
    );
    if (wait) {
      // A departing page cannot reliably wait. Dropping this best-effort batch
      // is preferable to bypassing the user's rate budget.
      if (this.closing) {
        this.pause();
        return;
      }
      this.schedule(wait);
      return;
    }
    this.clearTimer();
    const body = this.retryBody ?? boundedBatch(this.queue, this.status);
    const revision = this.retryBody ? this.retryRevision : this.revision;
    const epoch = this.epoch;
    this.inFlight = true;
    this.request = new AbortController();
    if (this.closing) this.finalSent = true;
    sendTimes.push(now);
    try {
      const result = await this.send(body, {
        keepalive: this.closing,
        signal: this.request.signal,
      });
      if (epoch !== this.epoch) return;
      if (
        !result ||
        !Number.isInteger(result.accepted) ||
        result.accepted < 0 ||
        result.accepted > body.segments.length
      ) {
        this.halt();
        return;
      }
      // accepted:0 is a successful deduplicated retry, not a quota error.
      this.queue.splice(0, body.segments.length);
      this.dirty = revision !== this.revision;
      this.retryBody = null;
      this.attempts = 0;
      this.notBefore = 0;
      this.health("ok");
    } catch (error) {
      if (epoch !== this.epoch) return;
      const status = error instanceof LessonLightError ? error.status : 0;
      // All permanent 4xx (including quota/429) fail closed. Only timeouts and
      // network/5xx failures get up to two retries (three attempts total).
      if (
        (status >= 400 && status < 500 && status !== 408) ||
        ++this.attempts >= 3 ||
        this.closing
      ) {
        this.halt();
      } else {
        this.retryBody = body;
        this.retryRevision = revision;
        this.notBefore = Date.now() + 2500 * 2 ** (this.attempts - 1);
        this.health("retrying");
      }
    } finally {
      this.inFlight = false;
      this.request = null;
      if (this.closing) {
        if (!this.finalSent) void this.flush();
        else this.pause();
      } else if (
        !this.paused &&
        !this.terminal &&
        (this.queue.length || this.dirty || this.retryBody)
      ) {
        this.schedule(
          this.retryBody || this.dirty || this.queue.length >= 20 ? 0 : 15_000
        );
      }
    }
  }
}

/** One actual join, independent of React rendering/navigation. */
export class SelfTranscriptionSession {
  private api: JitsiExternalApi;
  private Engine: SpeechConstructor;
  private allowed: () => boolean;
  private publish: (state: CaptureState) => void;
  private joinedAt: number;
  private uploader: SelfTranscriptUploader;
  private recognition: SpeechEngine | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private watchdog: ReturnType<typeof setTimeout> | null = null;
  private closed = false;
  private consent = false;
  private initialMuteKnown = false;
  private muteError = false;
  private muted = true;
  private muteRevision = 0;
  private failures = 0;
  private emptyEnds = 0;
  private failed = false;
  private uploadState: "ok" | "retrying" | "halted" = "ok";

  constructor(options: {
    api: JitsiExternalApi;
    Engine: SpeechConstructor;
    joinedAt: number;
    allowed: () => boolean;
    send: TranscriptSender;
    onState: (state: CaptureState) => void;
  }) {
    this.api = options.api;
    this.Engine = options.Engine;
    this.allowed = options.allowed;
    this.publish = options.onState;
    this.joinedAt = options.joinedAt;
    this.uploader = new SelfTranscriptUploader(
      options.send,
      options.allowed,
      (state) => {
        this.uploadState = state;
        if (this.closed) return;
        if (state !== "ok") {
          this.abortRecognition();
          this.publish(state === "halted" ? "blocked" : "retrying");
        } else this.reconcile();
      }
    );
    this.api.addListener("audioMuteStatusChanged", this.onMute);
    const revision = this.muteRevision;
    this.publish("waiting");
    // No recognition until this initial promise resolves. A newer mute event
    // wins over a potentially stale response from the iframe.
    Promise.resolve()
      .then(() => this.api.isAudioMuted())
      .then((muted) => {
        if (this.closed) return;
        if (typeof muted !== "boolean") throw new Error("Unknown mute state");
        this.initialMuteKnown = true;
        if (this.muteRevision === revision) this.muted = muted;
        this.reconcile();
      })
      .catch(() => {
        if (!this.closed) {
          this.muteError = true;
          this.abortRecognition();
          this.publish("error");
        }
      });
  }

  private onMute = (event: unknown) => {
    if (this.closed) return;
    this.muteRevision++;
    // Unknown events also fail closed, rather than treating absence as unmute.
    this.muted = (event as { muted?: unknown } | null)?.muted !== false;
    if (this.muted) this.abortRecognition(); // synchronous, before React state
    this.reconcile();
  };

  setConsent(consent: boolean) {
    this.consent = consent;
    if (!consent) {
      this.abortRecognition();
      this.uploader.setStatus("stopped");
    }
    this.reconcile();
  }

  refreshPermission() {
    this.reconcile();
  }

  private permitted() {
    return !this.closed && this.consent && this.allowed();
  }

  private abortRecognition() {
    if (this.timer !== null) clearTimeout(this.timer);
    if (this.watchdog !== null) clearTimeout(this.watchdog);
    this.timer = null;
    this.watchdog = null;
    this.resuming = false;
    const old = this.recognition;
    // Invalidate before abort: old onresult/onend callbacks cannot leak speech
    // or restart capture, even if the provider delivers them synchronously.
    this.recognition = null;
    if (old) {
      old.onstart = old.onend = old.onerror = old.onresult = null;
      try {
        old.abort();
      } catch {
        /* already stopped */
      }
    }
  }

  private reconcile() {
    if (this.closed) return;
    if (!this.allowed()) {
      this.consent = false;
      this.abortRecognition();
      this.uploader.pause();
      this.publish("stopped");
      return;
    }
    this.uploader.resume();
    if (!this.consent) {
      this.publish("stopped");
      return;
    }
    if (this.uploadState === "halted") {
      this.publish("blocked");
      return;
    }
    if (this.uploadState === "retrying") {
      this.publish("retrying");
      return;
    }
    if (this.failed || this.muteError) return;
    if (!this.initialMuteKnown) {
      this.publish("waiting");
      return;
    }
    if (this.muted) {
      this.uploader.setStatus("muted");
      this.publish("muted");
      return;
    }
    if (!this.recognition && this.timer === null)
      this.startRecognition(this.resuming);
  }

  private resuming = false;

  private startRecognition(quiet = false) {
    this.resuming = false;
    if (
      !this.permitted() ||
      this.muted ||
      !this.initialMuteKnown ||
      this.failed
    )
      return;
    let recognition: SpeechEngine;
    try {
      recognition = new this.Engine();
    } catch {
      this.fail("error");
      return;
    }
    this.recognition = recognition;
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    const current = () => {
      if (this.recognition !== recognition || this.closed) return false;
      if (!this.permitted() || this.muted) {
        this.reconcile();
        return false;
      }
      return true;
    };
    let hadFinal = false;
    let startedAt = 0;
    // Providers end continuous sessions after silence; a run that really
    // started is a normal pause (e.g. listening to recitation), not a failure.
    const ended = () => {
      if (startedAt && Date.now() - startedAt >= 3000) this.resume();
      else this.restart(false);
    };
    recognition.onstart = () => {
      if (!current()) return;
      startedAt = Date.now();
      if (this.watchdog !== null) clearTimeout(this.watchdog);
      this.watchdog = null;
      this.publish("listening");
      this.uploader.setStatus("started");
    };
    recognition.onresult = (event) => {
      if (!current()) return;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (!current()) break;
        const result = event.results[i];
        if (!result?.isFinal || !result[0]?.transcript?.trim()) continue;
        hadFinal = true;
        this.emptyEnds = 0;
        this.failures = 0;
        try {
          this.uploader.enqueue(
            splitFinalText(
              result[0].transcript,
              (Date.now() - this.joinedAt) / 1000
            )
          );
        } catch {
          this.fail("error");
        }
      }
    };
    recognition.onerror = (event) => {
      if (!current()) return;
      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        this.fail("denied");
        return;
      }
      if (event.error === "no-speech") {
        ended();
      } else if (event.error === "network" || event.error === "aborted") {
        this.restart(true);
      } else this.fail("error");
    };
    recognition.onend = () => {
      if (!current()) return;
      if (hadFinal) this.emptyEnds = 0;
      ended();
    };
    if (!quiet) this.publish("starting");
    this.watchdog = setTimeout(() => {
      if (current()) this.restart(true);
    }, 10_000);
    try {
      recognition.start();
    } catch {
      this.restart(true);
    }
  }

  private resume() {
    this.abortRecognition();
    this.emptyEnds = 0;
    this.resuming = true;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.reconcile();
    }, 500);
  }

  private restart(failure: boolean) {
    this.abortRecognition();
    const count = failure ? ++this.failures : ++this.emptyEnds;
    // Network errors have a lifetime budget; no-speech/empty ends have a
    // consecutive budget reset only by actual final text, never by onstart.
    if (count > (failure ? 3 : 5)) {
      this.fail("error");
      return;
    }
    this.publish("retrying");
    this.uploader.setStatus("error");
    this.timer = setTimeout(
      () => {
        this.timer = null;
        this.reconcile();
      },
      Math.min(30_000, (failure ? 2000 : 3000) * 2 ** (count - 1))
    );
  }

  private fail(state: "error" | "denied") {
    this.failed = true;
    this.abortRecognition();
    this.publish(state);
    this.uploader.setStatus(state);
  }

  close(flush = true) {
    if (this.closed) return;
    this.closed = true;
    this.abortRecognition();
    this.api.removeListener("audioMuteStatusChanged", this.onMute);
    this.uploader.close(flush);
    this.publish("stopped");
  }
}
