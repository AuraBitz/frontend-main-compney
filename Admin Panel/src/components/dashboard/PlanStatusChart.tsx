"use client";

import type { ChartPoint } from "@/lib/dashboard-utils";
import { cn } from "@/lib/utils";

interface PlanStatusChartProps {
  data: ChartPoint[];
  loading?: boolean;
  title?: string;
  description?: string;
}

export function PlanStatusChart({
  data,
  loading,
  title = "Plan status",
  description = "Client plan status breakdown",
}: PlanStatusChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="dashboard-chart rounded-2xl border border-border/80 bg-card p-5 shadow-sm ring-1 ring-border/40">
      <div className="mb-4">
        <h3 className="font-heading text-base font-semibold text-foreground">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {loading ? (
        <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      ) : total === 0 ? (
        <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
          No client data
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((point, i) => {
            const pct = Math.round((point.count / max) * 100);
            return (
              <div key={point.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{point.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {point.count}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted/60">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      i === 0 && "bg-emerald-500",
                      i === 1 && "bg-amber-500",
                      i === 2 && "bg-rose-500/80",
                      i > 2 && "bg-primary"
                    )}
                    style={{ width: `${Math.max(pct, point.count > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
