import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardHeroProps {
  title: string;
  subtitle: string;
  badge?: string;
  actions?: ReactNode;
  className?: string;
}

export function DashboardHero({
  title,
  subtitle,
  badge,
  actions,
  className,
}: DashboardHeroProps) {
  return (
    <div
      className={cn(
        "dashboard-hero relative overflow-hidden rounded-2xl p-6 sm:p-8",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          {badge && (
            <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
              {badge}
            </span>
          )}
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        </div>
        {actions && (
          <div className="relative shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}
