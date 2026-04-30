"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  // Dark-first default to match SSR bootstrap.
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    const initialTheme: Theme = stored === "light" ? "light" : "dark";
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  const nextTheme: Theme = theme === "dark" ? "light" : "dark";

  function toggleTheme() {
    setTheme(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <button
      type="button"
      className="theme-btn"
      onClick={toggleTheme}
      aria-label={mounted ? `Switch to ${nextTheme} mode` : "Toggle theme"}
      title={mounted ? `Switch to ${nextTheme} mode` : "Toggle theme"}
    >
      <span aria-hidden="true">{theme === "dark" ? "◐" : "◑"}</span>
    </button>
  );
}
