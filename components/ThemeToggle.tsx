"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const CYCLE: Array<import("./ThemeProvider").Theme> = ["system", "light", "dark"];

const LABELS = { system: "System theme", light: "Light mode", dark: "Dark mode" } as const;

const ICONS = {
  system: Monitor,
  light: Sun,
  dark: Moon,
} as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  function cycle() {
    const next = CYCLE[(CYCLE.indexOf(theme) + 1) % CYCLE.length];
    setTheme(next);
  }

  const Icon = ICONS[theme];

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={LABELS[theme]}
      title={LABELS[theme]}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
    >
      <Icon size={16} strokeWidth={1.75} />
    </button>
  );
}
