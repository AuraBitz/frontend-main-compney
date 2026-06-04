"use client";

import type { ChartPoint } from "@/lib/dashboard-utils";
import { formatINR } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

interface PlanAmountChartProps {
  data: ChartPoint[];
  loading?: boolean;
  totalAmount?: number;
  title?: string;
  description?: string;
  emptyMessage?: string;
}

export function PlanAmountChart({
  data,
  loading,
  totalAmount = 0,
  title = "Revenue by plan",
  description = "Total plan amount for clients in this project",
  emptyMessage = "No plan amount data for clients",
}: PlanAmountChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="dashboard-chart rounded-2xl border border-border/80 bg-card p-5 shadow-sm ring-1 ring-border/40">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-heading text-base font-semibold text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {!loading && totalAmount > 0 && (
          <p className="font-heading text-xl font-bold tabular-nums text-primary">
            {formatINR(totalAmount)}
          </p>
        )}
      </div>
      {loading ? (
        <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
          Loading chart...
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className="dashboard-chart-bars flex h-56 items-end gap-3 overflow-x-auto pb-1">
          {data.map((point) => {
            const heightPct = Math.round((point.count / max) * 100);
            return (
              <div
                key={point.label}
                className="flex min-w-[72px] flex-1 flex-col items-center gap-1.5"
                title={`${point.label}: ${formatINR(point.count)}`}
              >
                <span className="text-[10px] font-semibold tabular-nums text-primary">
                  {formatINR(point.count)}
                </span>
                <div className="flex w-full flex-1 items-end justify-center">
                  <div
                    className={cn(
                      "dashboard-chart-bar-amount w-full max-w-12 min-h-[6px] rounded-t-lg transition-all"
                    )}
                    style={{ height: `${Math.max(heightPct, 6)}%` }}
                  />
                </div>
                <span className="max-w-full truncate px-0.5 text-center text-[10px] font-medium text-foreground">
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
