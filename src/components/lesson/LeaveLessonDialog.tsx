"use client";

import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * Guards every leave action in the lesson room, because the control sits next
 * to the ones used during the lesson and an accidental press drops the call.
 */
export function LeaveLessonDialog({ open, onCancel, onConfirm }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-6"
      onClick={onCancel}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-lesson-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-card-border bg-background p-6 shadow-2xl"
      >
        <h2 id="leave-lesson-title" className="text-lg font-semibold">
          Leave the lesson?
        </h2>
        <p className="mt-2 text-sm text-foreground opacity-70">
          You will stop seeing and hearing the room. The lesson itself keeps
          running.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="inline-flex w-full items-center justify-center rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-600"
          >
            Stay in the lesson
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex w-full items-center justify-center rounded-xl border border-red-500/60 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
          >
            Leave the lesson
          </button>
        </div>
      </div>
    </div>
  );
}
