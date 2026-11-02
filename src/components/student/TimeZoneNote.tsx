import { Globe2 } from "lucide-react";
import { timeZoneLabel } from "@/lib/weekly-time";

export const TimeZoneNote = ({
  zone,
  sourceZone,
  className = "",
}: {
  zone: string;
  sourceZone?: string | null;
  className?: string;
}) => {
  if (!zone) return null;

  return (
    <p
      className={`flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-foreground opacity-65 ${className}`}
    >
      <Globe2 size={13} className="shrink-0" />
      <span>
        Times shown in your time zone · {timeZoneLabel(zone)}{" "}
        <span className="opacity-70">({zone})</span>
      </span>
      {sourceZone && sourceZone !== zone ? (
        <span>· teacher clock: {sourceZone}</span>
      ) : null}
    </p>
  );
};
