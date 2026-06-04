"use client";

import type { ChartPoint } from "@/lib/dashboard-utils";
import { cn } from "@/lib/utils";

interface ClientsChartProps {
  data: ChartPoint[];
  loading?: boolean;
}

export function ClientsChart({ data, loading }: ClientsChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="dashboard-chart rounded-2xl border border-border/80 bg-card p-5 shadow-sm ring-1 ring-border/40">
      <div className="mb-4">
        <h3 className="font-heading text-base font-semibold text-foreground">
          Clients overview
        </h3>
        <p className="text-sm text-muted-foreground">
          New clients per day in selected range
        </p>
      </div>
      {loading ? (
        <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
          Loading chart...
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
          No client data in this range
        </div>
      ) : (
        <div className="dashboard-chart-bars flex h-52 items-end gap-1 overflow-x-auto pb-1">
          {data.map((point) => {
            const heightPct = Math.round((point.count / max) * 100);
            return (
              <div
                key={point.label}
                className="flex min-w-9 flex-1 flex-col items-center gap-1"
                title={`${point.label}: ${point.count}`}
              >
                <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                  {point.count > 0 ? point.count : ""}
                </span>
                <div className="flex w-full flex-1 items-end justify-center">
                  <div
                    className={cn(
                      "dashboard-chart-bar w-full max-w-8 min-h-[4px] rounded-t-md transition-all",
                      point.count === 0 && "opacity-30"
                    )}
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                  />
                </div>
                <span className="max-w-full truncate text-center text-[9px] text-muted-foreground">
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
