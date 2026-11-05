"use client";

import { useEffect, useState } from "react";
import { backendAssetUrl } from "@/lib/backend-client";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

interface AvatarProps {
  name: string;
  src?: string | null;
  className?: string;
  fallbackClassName?: string;
}

/** Renders an API-hosted avatar and falls back to initials when it is missing. */
export function Avatar({
  name,
  src,
  className = "h-10 w-10 rounded-full text-sm",
  fallbackClassName = "bg-green-500/15 text-green-700 dark:text-green-400",
}: AvatarProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={backendAssetUrl(src)}
        alt={name || "Profile photo"}
        onError={() => setFailed(true)}
        className={`shrink-0 object-cover ${className}`}
      />
    );
  }

  return (
    <span
      aria-label={name || "Profile photo"}
      className={`flex shrink-0 items-center justify-center font-bold ${fallbackClassName} ${className}`}
    >
      {initials(name) || "?"}
    </span>
  );
}
