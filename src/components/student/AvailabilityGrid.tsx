"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { WEEK_DAY_ORDER } from "@/lib/weekly-time";
import { WEEKDAY_SHORT, formatTimeOfDay } from "@/lib/utils";
import type { StudentWeeklyPreference } from "@/types/onboarding";

const pad = (value: number) => String(value).padStart(2, "0");

/** Every hour of the day. The student offers the hour; the academy fits the real lesson inside it. */
export const WEEKLY_BLOCKS = Array.from({ length: 24 }, (_, index) => ({
  startsAtTime: `${pad(index)}:00`,
  // There is no 24:00 in a TimeOnly column, so the last window stops short of midnight.
  endsAtTime: index === 23 ? "23:59" : `${pad(index + 1)}:00`,
}));

type WeekBlock = (typeof WEEKLY_BLOCKS)[number];

/**
 * Students overwhelmingly answer with evenings, so those hours lead and nobody
 * scrolls past eight empty midnight rows to reach the times they want.
 */
export const WEEKLY_GROUPS: { label: string; blocks: WeekBlock[] }[] = [
  { label: "Evening", blocks: WEEKLY_BLOCKS.slice(16, 24) },
  { label: "Daytime", blocks: WEEKLY_BLOCKS.slice(6, 16) },
  { label: "Overnight", blocks: WEEKLY_BLOCKS.slice(0, 6) },
];

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
  // Painting turns a grid of 168 taps into one sweep across a morning.
  const [paintTo, setPaintTo] = useState<boolean | null>(null);
  const [activeDay, setActiveDay] = useState<number>(WEEK_DAY_ORDER[0]);

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

  const dayCount = (day: number) =>
    WEEKLY_BLOCKS.reduce(
      (total, block) => total + (selected.has(slotKey(day, block.startsAtTime)) ? 1 : 0),
      0
    );

  const paintHandlers = (key: string, isOn: boolean) => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      // Mouse gestures paint a run of cells; touch must stay free to scroll.
      if (event.pointerType !== "mouse") return;
      event.preventDefault();
      const next = !isOn;
      setPaintTo(next);
      toggle(key, next);
    },
    onPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === "mouse") return;
      toggle(key, !isOn);
    },
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      // Keyboard activation reaches click with no pointer detail.
      if (event.detail === 0) toggle(key, !isOn);
    },
    onPointerEnter: () => {
      if (paintTo === null || isOn === paintTo) return;
      toggle(key, paintTo);
    },
  });

  const cellClass = (isOn: boolean) =>
    `rounded-lg border font-semibold transition-colors duration-150 select-none ${
      isOn
        ? "border-green-500 bg-green-500 text-white"
        : "border-card-border bg-background text-foreground/70 hover:border-green-500 hover:bg-green-500/10"
    } ${disabled ? "cursor-not-allowed opacity-60" : ""}`;

  return (
    <>
      {/* A week of 24 hours is 168 cells; on a phone that only works one day at a time. */}
      <div className="sm:hidden">
        <div className="grid grid-cols-7 gap-1">
          {WEEK_DAY_ORDER.map((day) => {
            const count = dayCount(day);
            const isActive = day === activeDay;
            return (
              <button
                key={day}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveDay(day)}
                className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl border text-[11px] font-semibold uppercase transition-colors ${
                  isActive
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-card-border bg-background text-foreground/70"
                }`}
              >
                {WEEKDAY_SHORT[day]}
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    count
                      ? isActive
                        ? "bg-white"
                        : "bg-green-500"
                      : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Two columns of hours keep one group inside about a screenful. */}
        {WEEKLY_GROUPS.map((group) => (
          <div key={group.label} className="mt-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-foreground opacity-60">
              {group.label}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {group.blocks.map((block) => {
                const key = slotKey(activeDay, block.startsAtTime);
                const isOn = selected.has(key);
                return (
                  <button
                    key={block.startsAtTime}
                    type="button"
                    disabled={disabled}
                    aria-pressed={isOn}
                    aria-label={`${WEEKDAY_SHORT[activeDay]} ${formatTimeOfDay(
                      block.startsAtTime
                    )} to ${formatTimeOfDay(block.endsAtTime)}`}
                    onClick={() => toggle(key, !isOn)}
                    className={`flex min-h-[44px] items-center justify-center gap-1.5 text-sm ${cellClass(
                      isOn
                    )}`}
                  >
                    {formatTimeOfDay(block.startsAtTime)}
                    <span className={isOn ? "pop-in" : "opacity-0"}>✓</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div
        className="hidden overflow-x-auto sm:block"
        onDragStart={(event) => event.preventDefault()}
      >
        <div className="min-w-[560px]">
          <div className="grid grid-cols-[64px_repeat(7,1fr)] gap-1">
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

            {WEEKLY_GROUPS.map((group) => (
              <Fragment key={group.label}>
                <div className="col-span-8 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-foreground opacity-60">
                  {group.label}
                </div>
                {group.blocks.map((block) => (
                  <div key={block.startsAtTime} className="contents">
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
                          {...paintHandlers(key, isOn)}
                          className={`h-8 text-xs ${cellClass(isOn)}`}
                        >
                          <span
                            className={isOn ? "pop-in inline-block" : "invisible"}
                          >
                            ✓
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
