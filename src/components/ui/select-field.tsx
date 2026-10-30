"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  size?: "md" | "sm";
  className?: string;
  /** Compact trigger text when the option label is too long for the trigger. */
  selectedLabel?: string;
  ariaLabel?: string;
  /** Overrides the default full-width dropdown panel positioning/width. */
  menuClassName?: string;
  /** Adds a filter box at the top of the panel (useful for long lists). */
  searchable?: boolean;
}

export function SelectField({
  id,
  value,
  onChange,
  options,
  placeholder = "Choose…",
  disabled = false,
  size = "md",
  className = "",
  selectedLabel,
  ariaLabel,
  menuClassName,
  searchable = false,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const focusOption = (direction: 1 | -1) => {
    const nodes = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>("[role='option']") ??
        []
    );
    if (!nodes.length) return;
    const currentIndex = nodes.indexOf(
      document.activeElement as HTMLButtonElement
    );
    const nextIndex =
      currentIndex === -1
        ? direction === 1
          ? 0
          : nodes.length - 1
        : (currentIndex + direction + nodes.length) % nodes.length;
    nodes[nextIndex]?.focus();
  };

  const openAndFocus = () => {
    setOpen(true);
    requestAnimationFrame(() => {
      if (searchable) {
        searchRef.current?.focus();
        return;
      }
      const selected = listRef.current?.querySelector<HTMLButtonElement>(
        "[data-selected='true']"
      );
      (
        selected ??
        listRef.current?.querySelector<HTMLButtonElement>("[role='option']")
      )?.focus();
    });
  };

  const select = (next: string) => {
    onChange(next);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const selected = options.find((option) => option.value === value);
  const visibleOptions = query.trim()
    ? options.filter((option) =>
        option.label.toLowerCase().includes(query.trim().toLowerCase())
      )
    : options;
  const triggerSize =
    size === "sm" ? "rounded-lg px-3 py-1.5 text-sm" : "rounded-xl px-4 py-3";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openAndFocus())}
        onKeyDown={(event) => {
          if (
            event.key === "ArrowDown" ||
            event.key === "ArrowUp" ||
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            openAndFocus();
          }
        }}
        className={`flex w-full items-center justify-between gap-2 border border-card-border bg-background text-foreground focus:outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-50 ${triggerSize}`}
      >
        <span className={`truncate text-left ${selected ? "" : "opacity-60"}`}>
          {selectedLabel ?? selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={size === "sm" ? 15 : 18}
          className={`shrink-0 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-labelledby={id}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              focusOption(1);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              focusOption(-1);
            }
          }}
          className={`absolute z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-card-border bg-card-bg p-1 shadow-xl ${
            menuClassName ?? "left-0 right-0"
          }`}
        >
          {searchable && (
            <li className="sticky top-0 z-10 bg-card-bg p-1">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search…"
                aria-label="Search options"
                className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-green-500"
              />
            </li>
          )}
          {visibleOptions.length ? (
            visibleOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-selected={isSelected}
                    onClick={() => select(option.value)}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-green-500/10 focus:bg-green-500/10 focus:outline-none ${
                      isSelected
                        ? "font-semibold text-green-600"
                        : "text-foreground"
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check size={15} className="shrink-0" />}
                  </button>
                </li>
              );
            })
          ) : (
            <li className="px-3 py-2.5 text-sm opacity-60">
              {query.trim() ? "No matches." : "No options available"}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
