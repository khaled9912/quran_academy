"use client";

import { useCallback, useEffect, useState } from "react";
import { WEEK_DAY_ORDER } from "@/lib/weekly-time";
import { WEEKDAY_SHORT, formatTimeOfDay } from "@/lib/utils";
import type { StudentWeeklyPreference } from "@/types/onboarding";

const pad = (value: number) => String(value).padStart(2, "0");

/** Two-hour windows a student can offer. The academy fits the real lesson inside one. */
export const WEEKLY_BLOCKS = Array.from({ length: 8 }, (_, index) => {
  const start = 6 + index * 2;
  return { startsAtTime: `${pad(start)}:00`, endsAtTime: `${pad(start + 2)}:00` };
});

export const slotKey = (dayOfWeek: number, startsAtTime: string) =>
  `${dayOfWeek}|${startsAtTime}`;

export const slotsFromKeys = (keys: Iterable<string>) =>
  Array.from(keys).flatMap((key) => {
    const [day, start] = key.split("|");
    const block = WEEKLY_BLOCKS.find((item) => item.startsAtTime === start);
    return block
      ? [
          {
            dayOfWeek: Number(day),
            startsAtTime: block.startsAtTime,
            endsAtTime: block.endsAtTime,
          },
        ]
      : [];
  });

export const keysFromPreferences = (slots: StudentWeeklyPreference[]) =>
  new Set(slots.map((slot) => slotKey(slot.dayOfWeek, slot.startsAtTime)));

interface AvailabilityGridProps {
  selected: Set<string>;
  onToggle: (key: string, next: boolean) => void;
  /** Paint-on-drag is pointer-only; keyboard users get the same cells as buttons. */
  disabled?: boolean;
}

export function AvailabilityGrid({
  selected,
  onToggle,
  disabled = false,
}: AvailabilityGridProps) {
  // Painting turns a grid of 56 taps into one sweep across a morning.
  const [paintTo, setPaintTo] = useState<boolean | null>(null);

  useEffect(() => {
    if (paintTo === null) return;
    const stop = () => setPaintTo(null);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [paintTo]);

  const toggle = useCallback(
    (key: string, next: boolean) => {
      if (disabled) return;
      onToggle(key, next);
    },
    [disabled, onToggle]
  );

  return (
    <div
      className="overflow-x-auto"
      onDragStart={(event) => event.preventDefault()}
    >
      <div className="min-w-[560px]">
        <div className="grid grid-cols-[64px_repeat(7,1fr)] gap-1.5">
          <span />
          {WEEK_DAY_ORDER.map((day, index) => (
            <span
              key={day}
              className="rise-in pb-1 text-center text-xs font-semibold uppercase tracking-wide text-foreground opacity-70"
              style={{ animationDelay: `${index * 28}ms` }}
            >
              {WEEKDAY_SHORT[day]}
            </span>
          ))}

          {WEEKLY_BLOCKS.map((block, rowIndex) => (
            <div
              key={block.startsAtTime}
              className="contents"
            >
              <span className="flex items-center justify-end pr-1 text-[11px] font-medium text-foreground opacity-60">
                {formatTimeOfDay(block.startsAtTime)}
              </span>
              {WEEK_DAY_ORDER.map((day) => {
                const key = slotKey(day, block.startsAtTime);
                const isOn = selected.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={disabled}
                    aria-pressed={isOn}
                    aria-label={`${WEEKDAY_SHORT[day]} ${formatTimeOfDay(
                      block.startsAtTime
                    )} to ${formatTimeOfDay(block.endsAtTime)}`}
                    onPointerDown={(event) => {
                      // Mouse gestures paint a run of cells; touch must stay
                      // free to scroll the grid sideways.
                      if (event.pointerType !== "mouse") return;
                      event.preventDefault();
                      const next = !isOn;
                      setPaintTo(next);
                      toggle(key, next);
                    }}
                    onPointerUp={(event) => {
                      if (event.pointerType === "mouse") return;
                      toggle(key, !isOn);
                    }}
                    onClick={(event) => {
                      // Keyboard activation reaches click with no pointer detail.
                      if (event.detail === 0) toggle(key, !isOn);
                    }}
                    onPointerEnter={() => {
                      if (paintTo === null || isOn === paintTo) return;
                      toggle(key, paintTo);
                    }}
                    className={`h-9 rounded-lg border text-xs font-semibold transition-colors duration-150 select-none ${
                      isOn
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-card-border bg-background text-transparent hover:border-green-500 hover:bg-green-500/10"
                    } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <span className={isOn ? "pop-in inline-block" : "invisible"}>
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
