"use client";

import { PhoneCall, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LessonCall } from "@/types/lesson";

type Props = {
  call: LessonCall;
  onDismiss: () => void;
};

const calledAt = (value: string) =>
  new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

/**
 * Floats over every screen, including the lesson room, because a call is only
 * useful to someone who is not in the room yet. It is a real element rather
 * than a toast so it survives until it is answered.
 */
export function IncomingCallAlert({ call, onDismiss }: Props) {
  const link = `/lesson/${call.lessonId}`;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[2000] flex justify-center px-4">
      <div
        role="alert"
        className="pointer-events-auto w-full max-w-md rounded-3xl border-2 border-green-600 bg-card-bg p-5 shadow-2xl dark:border-green-500 dark:text-foreground"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 animate-pulse items-center justify-center rounded-full bg-green-500/15 text-green-700 dark:text-green-400">
            <PhoneCall size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{call.callerName} is calling you</p>
            <p className="text-xs opacity-60">
              {call.callerRole === "teacher"
                ? "Your teacher"
                : call.callerRole === "student"
                  ? "Your student"
                  : "The academy"}{" "}
              · called {calledAt(call.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Stop ringing"
            className="rounded-full p-1.5 text-foreground opacity-60 transition hover:bg-background hover:opacity-100"
          >
            <X size={18} />
          </button>
        </div>
        <p className="mt-3 text-sm text-foreground opacity-70">
          Open the lesson room to answer.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild onClick={onDismiss} className="rounded-xl px-5">
            <Link href={link}>Join the lesson</Link>
          </Button>
          <Button variant="outline" onClick={onDismiss} className="rounded-xl">
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
