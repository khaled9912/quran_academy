import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const timeOfDayFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const WEEKDAY_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

export const weekdayLabel = (dayOfWeek: number) =>
  WEEKDAY_LABELS[dayOfWeek] ?? "";

/** Formats a weekly "HH:mm" value without inventing a date. */
export const formatTimeOfDay = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return "—";
  return timeOfDayFormatter.format(new Date(2000, 0, 1, hours, minutes));
};

export const formatWeeklyTimeRange = (
  startsAtTime: string,
  endsAtTime: string
) => `${formatTimeOfDay(startsAtTime)} – ${formatTimeOfDay(endsAtTime)}`;

export const formatWeeklySlot = (
  dayOfWeek: number,
  startsAtTime: string,
  endsAtTime: string
) =>
  `${weekdayLabel(dayOfWeek)} · ${formatWeeklyTimeRange(
    startsAtTime,
    endsAtTime
  )}`;
