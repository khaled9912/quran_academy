"use client";

import type { CaptureState } from "@/services/self-transcription.service";

export function SelfTranscriptionConsent({
  consent,
  supported,
  onChange,
}: {
  consent: boolean;
  supported: boolean | null;
  onChange: (consent: boolean) => void;
}) {
  if (supported !== true) {
    return (
      <p className="text-sm text-white/75">
        {supported === null
          ? "Checking transcription availability…"
          : "Self-mic transcription is unavailable on this device/browser. This lesson is not actively monitored."}
      </p>
    );
  }
  return (
    <label className="flex max-w-xl cursor-pointer items-start gap-3 rounded-xl border border-white/20 bg-white/5 p-3 text-left text-xs leading-relaxed text-white">
      <input
        type="checkbox"
        checked={consent}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      />
      <span>
        <strong className="block text-sm">
          Optional: I consent to English self-mic transcription.
        </strong>
        Only my own microphone is processed by my browser&apos;s speech service,
        which may send audio to its provider. The academy retains transcript
        text for 30 days and does not store audio. Automatic detection is
        imperfect; this is not live monitoring. I can stop transcription at any
        time, and I can join without consenting.
      </span>
    </label>
  );
}

const STATE_COPY: Record<CaptureState, string> = {
  waiting: "Waiting for microphone state — not capturing",
  starting: "Starting browser speech service",
  listening: "Processing your own microphone (English)",
  muted: "Paused — your lesson microphone is muted",
  retrying: "Service interrupted — capture paused; retrying",
  denied: "Speech permission denied — not capturing",
  stopped: "Off — not capturing",
  error: "Transcription error — not capturing",
  blocked: "Transcription stopped — service unavailable or limit reached",
};

export function SelfTranscriptionControls({
  enabled,
  consent,
  supported,
  state,
  onConsent,
}: {
  enabled: boolean;
  consent: boolean;
  supported: boolean | null;
  state: CaptureState;
  onConsent: (consent: boolean) => void;
}) {
  const message = !enabled
    ? "Off — transcription is not enabled or config is unavailable"
    : supported === false
      ? "Unavailable on this device/browser — not capturing"
      : supported === null
        ? "Checking availability — not capturing"
        : !consent
          ? "Off — consent not given"
          : STATE_COPY[state];
  return (
    <section
      aria-label="Self-mic transcription"
      className="border-t border-white/10 bg-neutral-900 px-3 py-2 text-xs text-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p role="status" className="min-w-0 flex-1">
          Transcription: {message}
        </p>
        {consent && (
          <button
            type="button"
            onClick={() => onConsent(false)}
            className="rounded-lg border border-white/30 px-2 py-1.5 font-semibold hover:bg-white/10 focus-visible:outline focus-visible:outline-2"
          >
            Stop transcription
          </button>
        )}
      </div>
      <p className="mt-1 text-white/60">
        Not actively monitored. Automatic detection can miss or misinterpret
        speech.
      </p>
      {enabled && !consent && supported === true && (
        <details className="mt-2">
          <summary className="cursor-pointer rounded py-1 font-semibold underline focus-visible:outline focus-visible:outline-2">
            Enable optional transcription
          </summary>
          <div className="mt-2 max-h-52 overflow-y-auto">
            <SelfTranscriptionConsent
              consent={consent}
              supported={supported}
              onChange={onConsent}
            />
          </div>
        </details>
      )}
    </section>
  );
}
