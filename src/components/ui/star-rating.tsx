"use client";

import { useState } from "react";
import { Star } from "lucide-react";

const STARS = [1, 2, 3, 4, 5];

export function StarRating({
  value,
  count,
  size = 16,
  className = "",
}: {
  value?: number | null;
  count?: number;
  size?: number;
  className?: string;
}) {
  if (value == null || count === 0) {
    return (
      <span
        className={`text-xs font-semibold text-foreground opacity-60 ${className}`}
      >
        No reviews yet
      </span>
    );
  }

  const rounded = Math.round(value);

  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      aria-label={`${value.toFixed(1)} out of 5 stars from ${count ?? 0} review${count === 1 ? "" : "s"}`}
    >
      <span
        className="inline-flex items-center gap-0.5 text-amber-500"
        aria-hidden
      >
        {STARS.map((star) => (
          <Star
            key={star}
            size={size}
            fill={star <= rounded ? "currentColor" : "none"}
            className={star <= rounded ? "" : "text-amber-500/40"}
          />
        ))}
      </span>
      <span className="text-sm font-semibold">{value.toFixed(1)}</span>
      {count != null && (
        <span className="text-xs text-foreground opacity-60">({count})</span>
      )}
    </span>
  );
}

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div
      className="inline-flex items-center gap-1"
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => setHover(0)}
    >
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          disabled={disabled}
          onMouseEnter={() => setHover(star)}
          onFocus={() => setHover(star)}
          onBlur={() => setHover(0)}
          onClick={() => onChange(star)}
          className="rounded-md p-0.5 text-amber-500 transition hover:scale-110 disabled:opacity-50"
        >
          <Star
            size={32}
            fill={star <= active ? "currentColor" : "none"}
            className={star <= active ? "" : "text-amber-500/40"}
          />
        </button>
      ))}
    </div>
  );
}
