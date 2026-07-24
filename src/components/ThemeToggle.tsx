"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const style = {
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: 8,
    height: 34,
    width: 34,
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center",
    cursor: "pointer",
    color: "var(--text)",
    transition: "all 0.2s"
  };

  if (!mounted) {
    return (
      <button style={style}>
        <div style={{ width: 14, height: 14 }} />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      style={style}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === "dark" ? (
        <Sun size={14} color="var(--text)" />
      ) : (
        <Moon size={14} color="var(--text)" />
      )}
    </button>
  );
}
