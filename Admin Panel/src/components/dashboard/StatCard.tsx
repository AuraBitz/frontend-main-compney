import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent?: "primary" | "emerald" | "amber" | "violet";
  loading?: boolean;
}

const accentStyles = {
  primary: "bg-primary/10 text-primary",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent = "primary",
  loading,
}: StatCardProps) {
  return (
    <div className="dashboard-stat rounded-2xl border border-border/80 bg-card p-5 shadow-sm ring-1 ring-border/40 transition-all hover:border-primary/20 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 font-heading text-3xl font-bold tracking-tight tabular-nums text-foreground">
            {loading ? "—" : value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            accentStyles[accent]
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}
