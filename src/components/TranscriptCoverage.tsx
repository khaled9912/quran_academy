import type { TranscriptCapture } from "@/types/transcript";

const statusLabel: Record<string, string> = {
  awaiting: "No capture status received",
  started: "Capture started",
  muted: "Microphone muted",
  unsupported: "Device cannot transcribe",
  denied: "Permission or consent not granted",
  stopped: "Capture stopped",
  error: "Capture unavailable",
};

export function TranscriptCoverage({
  captures,
}: {
  captures: TranscriptCapture[];
}) {
  return (
    <div className="mb-5 rounded-2xl border border-card-border bg-card-bg p-4 text-sm">
      <p className="font-semibold">Capture coverage</p>
      <p className="mt-1 opacity-70">
        Browser text and keyword flags are unverified review signals. Missing
        text can mean silence, a muted microphone, no consent, or a technical
        limitation; it is not evidence of misconduct. Transcript text expires
        after 30 days.
      </p>
      {captures.length > 0 ? (
        <ul className="mt-3 space-y-1">
          {captures.map((capture) => (
            <li key={capture.role}>
              <span className="capitalize font-semibold">{capture.role}</span>
              {": "}
              {statusLabel[capture.lastStatus] ?? "Status unavailable"}
              {" · "}
              {capture.segmentCount} segments
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 opacity-70">No retained browser capture status.</p>
      )}
    </div>
  );
}
