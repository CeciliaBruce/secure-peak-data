"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to dark theme
      setTheme("dark");
      applyTheme("dark");
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;

    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.toggle("dark", systemTheme === "dark");
    } else {
      root.classList.toggle("dark", newTheme === "dark");
    }
  };

  const cycleTheme = () => {
    const themes: Theme[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];

    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-5 h-5 text-yellow-500" />;
      case "dark":
        return <Moon className="w-5 h-5 text-blue-400" />;
      case "system":
        return <Monitor className="w-5 h-5 text-purple-400" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case "light":
        return "Light Mode";
      case "dark":
        return "Dark Mode";
      case "system":
        return "System Mode";
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="glass-modern rounded-2xl p-3 hover:scale-110 transition-all duration-300 group relative overflow-hidden"
      aria-label={`Switch to ${getLabel()}`}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-energy opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity duration-300" />

      {/* Icon with glow */}
      <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
        {getIcon()}
      </div>

      {/* Tooltip */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
        {getLabel()}
      </div>
    </button>
  );
}
