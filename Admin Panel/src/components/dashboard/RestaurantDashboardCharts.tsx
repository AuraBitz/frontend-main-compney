"use client";

import type { BookingTrendGranularity, ChartPoint } from "@/lib/dashboard-utils";
import { cn } from "@/lib/utils";

interface RestaurantBarChartProps {
  data: ChartPoint[];
  loading?: boolean;
  title: string;
  description?: string;
  barClassName?: string;
  emptyLabel?: string;
  granularity?: BookingTrendGranularity;
  onGranularityChange?: (value: BookingTrendGranularity) => void;
}

const GRANULARITY_OPTIONS: { value: BookingTrendGranularity; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

export function RestaurantBarChart({
  data,
  loading,
  title,
  description,
  barClassName = "dashboard-chart-bar-amount",
  emptyLabel = "No data yet",
  granularity,
  onGranularityChange,
}: RestaurantBarChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="dashboard-chart rounded-2xl border border-border/80 bg-card p-5 shadow-sm ring-1 ring-border/40">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-heading text-base font-semibold text-foreground">
            {title}
          </h3>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {granularity && onGranularityChange ? (
          <div className="inline-flex shrink-0 rounded-lg border border-border/80 bg-muted/30 p-0.5">
            {GRANULARITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onGranularityChange(option.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  granularity === option.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {loading ? (
        <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
          Loading chart...
        </div>
      ) : data.every((point) => point.count === 0) ? (
        <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        <div className="dashboard-chart-bars flex h-52 items-end gap-2 overflow-x-auto pb-1">
          {data.map((point) => {
            const heightPct = Math.round((point.count / max) * 100);
            return (
              <div
                key={point.label}
                className="flex min-w-10 flex-1 flex-col items-center gap-1"
                title={`${point.label}: ${point.count}`}
              >
                <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                  {point.count > 0 ? point.count : ""}
                </span>
                <div className="flex w-full flex-1 items-end justify-center">
                  <div
                    className={cn(
                      barClassName,
                      "w-full max-w-10 min-h-[4px] rounded-t-lg transition-all",
                      point.count === 0 && "opacity-30"
                    )}
                    style={{ height: `${Math.max(heightPct, 6)}%` }}
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

interface StatusBreakdownProps {
  items: { label: string; count: number; color: string }[];
  loading?: boolean;
  title: string;
  description?: string;
}

export function RestaurantStatusBreakdown({
  items,
  loading,
  title,
  description,
}: StatusBreakdownProps) {
  const max = Math.max(...items.map((item) => item.count), 1);
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="dashboard-chart rounded-2xl border border-border/80 bg-card p-5 shadow-sm ring-1 ring-border/40">
      <div className="mb-4">
        <h3 className="font-heading text-base font-semibold text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {loading ? (
        <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      ) : total === 0 ? (
        <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
          No records yet
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const pct = Math.round((item.count / max) * 100);
            return (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{item.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {item.count}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted/60">
                  <div
                    className={cn("h-full rounded-full transition-all", item.color)}
                    style={{
                      width: `${Math.max(pct, item.count > 0 ? 8 : 0)}%`,
                    }}
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

interface OccupancyRingProps {
  available: number;
  reserved: number;
  booked: number;
  total: number;
  loading?: boolean;
}

export function RestaurantOccupancyRing({
  available,
  reserved,
  booked,
  total,
  loading,
}: OccupancyRingProps) {
  const occupied = reserved + booked;
  const occupancyPct = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm ring-1 ring-border/40">
      <h3 className="font-heading text-base font-semibold">Floor occupancy</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Live table status across your restaurant
      </p>
      {loading ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex size-36 items-center justify-center">
            <svg viewBox="0 0 36 36" className="size-36 -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted/30"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${occupancyPct} 100`}
                className="text-orange-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold tabular-nums">{occupancyPct}%</span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                occupied
              </span>
            </div>
          </div>
          <div className="grid w-full max-w-xs gap-2 text-sm">
            <LegendRow color="bg-emerald-500" label="Available" value={available} />
            <LegendRow color="bg-amber-500" label="Reserved" value={reserved} />
            <LegendRow color="bg-red-500" label="Booked" value={booked} />
            <LegendRow color="bg-muted-foreground/40" label="Total tables" value={total} />
          </div>
        </div>
      )}
    </div>
  );
}

function LegendRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className={cn("size-2.5 rounded-full", color)} />
        <span>{label}</span>
      </div>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
