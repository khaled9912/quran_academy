"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useToast } from "@/providers/toast-provider";
import {
  LessonLightError,
  postLessonLight,
} from "@/services/self-transcription.service";

/** Non-modal so the persistent room is never removed or replaced. */
export function StudentConcernReport({ lessonId }: { lessonId: string }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const request = useRef<AbortController | null>(null);
  const { showToast } = useToast();
  const id = useId();
  const trimmed = detail.trim();
  const valid = trimmed.length >= 5 && trimmed.length <= 1000;

  useEffect(() => {
    if (open) textarea.current?.focus();
  }, [open]);
  useEffect(() => () => request.current?.abort(), []);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  return (
    <div className="border-t border-white/10 bg-neutral-900 px-3 py-2 text-white">
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => (open ? close() : setOpen(true))}
        className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20 focus-visible:outline focus-visible:outline-2"
      >
        {open ? "Close concern report" : "Report a concern"}
      </button>
      {open && (
        <section
          id={id}
          aria-labelledby={`${id}-title`}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              close();
            }
          }}
          className="mt-3 max-h-[45vh] overflow-y-auto rounded-xl border border-card-border bg-background p-4 text-foreground"
        >
          <h2 id={`${id}-title`} className="text-sm font-semibold">
            Report a lesson concern
          </h2>
          <p
            id={`${id}-privacy`}
            className="mt-2 text-xs leading-relaxed opacity-75"
          >
            Your report goes to academy staff for confidential review, not to
            the lesson chat. Staff may need to share relevant information to
            address a safety concern. This is not an emergency or
            live-monitoring service. Sending a report will not end your call.
          </p>
          {sent ? (
            <p role="status" className="mt-3 text-sm">
              Your concern has been submitted for this lesson.
            </p>
          ) : (
            <form
              className="mt-3 space-y-2"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!valid || request.current) return;
                const controller = new AbortController();
                request.current = controller;
                setPending(true);
                try {
                  await postLessonLight(
                    lessonId,
                    "incident",
                    { type: "conduct_concern", detail: trimmed },
                    { signal: controller.signal }
                  );
                  if (controller.signal.aborted) return;
                  setSent(true);
                  setDetail("");
                  showToast("Your concern was sent to the academy.", "success");
                } catch (failure) {
                  if (controller.signal.aborted) return;
                  const duplicate =
                    failure instanceof LessonLightError &&
                    failure.status === 409;
                  if (duplicate) {
                    setSent(true);
                    setDetail("");
                  }
                  showToast(
                    duplicate
                      ? "A concern has already been submitted for this lesson."
                      : "Could not send your concern. Please try again.",
                    duplicate ? "info" : "error"
                  );
                } finally {
                  request.current = null;
                  if (!controller.signal.aborted) setPending(false);
                }
              }}
            >
              <label
                htmlFor={`${id}-detail`}
                className="block text-xs font-semibold"
              >
                What happened? (5–1,000 characters)
              </label>
              <textarea
                ref={textarea}
                id={`${id}-detail`}
                aria-describedby={`${id}-privacy ${id}-count`}
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
                minLength={5}
                maxLength={1000}
                required
                disabled={pending}
                rows={4}
                className="w-full rounded-lg border border-card-border bg-background p-2 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500 disabled:opacity-60"
              />
              <p id={`${id}-count`} className="text-xs opacity-60">
                {trimmed.length}/1,000
              </p>
              <button
                type="submit"
                disabled={!valid || pending}
                className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {pending ? "Sending…" : "Send concern"}
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
