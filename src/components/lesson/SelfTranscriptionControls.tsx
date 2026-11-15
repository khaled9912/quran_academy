"use client";

import type { CaptureState } from "@/services/self-transcription.service";

const STATE_COPY: Record<CaptureState, string> = {
  waiting: "Waiting for microphone state",
  starting: "Starting browser speech service",
  listening: "Processing your own microphone (English)",
  muted: "Paused — your lesson microphone is muted",
  retrying: "Retrying transcription",
  denied: "Speech permission denied",
  stopped: "Off",
  error: "Transcription unavailable",
  blocked: "Transcription unavailable",
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
        : STATE_COPY[state];
  return (
    <section
      aria-label="Self-mic transcription"
      className="border-t border-white/10 bg-neutral-900 px-3 py-2 text-xs text-white"
    >
      <p role="status" className="min-w-0 flex-1">
        Transcription: {message}
      </p>
    </section>
  );
}
