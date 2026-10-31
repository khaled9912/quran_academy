"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
      return;
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
      aria-label="Toggle color theme"
      className="theme-toggle"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
