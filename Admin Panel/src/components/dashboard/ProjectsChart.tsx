"use client";

import type { ChartPoint } from "@/lib/dashboard-utils";
import { cn } from "@/lib/utils";

interface ProjectsChartProps {
  data: ChartPoint[];
  loading?: boolean;
}

export function ProjectsChart({ data, loading }: ProjectsChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="dashboard-chart rounded-2xl border border-border/80 bg-card p-5 shadow-sm ring-1 ring-border/40">
      <div className="mb-4">
        <h3 className="font-heading text-base font-semibold text-foreground">
          Projects overview
        </h3>
        <p className="text-sm text-muted-foreground">
          Projects in selected date range
        </p>
      </div>
      {loading ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      ) : data.every((d) => d.count === 0) ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          No project data in this range
        </div>
      ) : (
        <div className="dashboard-chart-bars flex h-40 items-end gap-2">
          {data.map((point) => {
            const heightPct = Math.round((point.count / max) * 100);
            return (
              <div
                key={point.label}
                className="flex min-w-12 flex-1 flex-col items-center gap-1"
                title={`${point.label}: ${point.count}`}
              >
                <span className="text-xs font-medium tabular-nums text-muted-foreground">
                  {point.count}
                </span>
                <div className="flex h-28 w-full items-end justify-center">
                  <div
                    className={cn(
                      "dashboard-chart-bar-projects w-full max-w-10 min-h-[6px] rounded-t-md",
                      point.count === 0 && "opacity-30"
                    )}
                    style={{ height: `${Math.max(heightPct, 6)}%` }}
                  />
                </div>
                <span className="truncate text-center text-[10px] text-muted-foreground">
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
