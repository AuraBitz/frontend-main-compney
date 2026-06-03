"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div
        className={cn("h-9 w-[4.5rem] rounded-lg border border-border bg-muted/50", className)}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-border bg-muted/50 p-0.5",
        className
      )}
      role="group"
      aria-label="Theme"
    >
      <Button
        type="button"
        variant={theme === "light" ? "default" : "ghost"}
        size="sm"
        className="h-8 gap-1.5 px-2.5"
        onClick={() => setTheme("light")}
        aria-pressed={theme === "light"}
        aria-label="Light mode"
      >
        <Sun className="size-4" />
        <span className="hidden sm:inline">Light</span>
      </Button>
      <Button
        type="button"
        variant={theme === "dark" ? "default" : "ghost"}
        size="sm"
        className="h-8 gap-1.5 px-2.5"
        onClick={() => setTheme("dark")}
        aria-pressed={theme === "dark"}
        aria-label="Dark mode"
      >
        <Moon className="size-4" />
        <span className="hidden sm:inline">Dark</span>
      </Button>
    </div>
  );
}
