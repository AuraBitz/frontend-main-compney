"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationButton } from "@/components/NotificationButton";

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/70 bg-card/90 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
      <SidebarTrigger className="-ml-1 shrink-0" />
      <div className="min-w-0 flex-1" />
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <NotificationButton />
        <ThemeToggle />
      </div>
    </header>
  );
}
