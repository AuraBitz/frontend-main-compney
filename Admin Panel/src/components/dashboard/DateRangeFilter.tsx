"use client";

import { CalendarRange, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface DateRangeValue {
  start: string;
  end: string;
}

interface DateRangeFilterProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  onApply: () => void;
  onReset: () => void;
  compact?: boolean;
}

export function DateRangeFilter({
  value,
  onChange,
  onApply,
  onReset,
  compact = false,
}: DateRangeFilterProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap items-end justify-end gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="dashboard-start-date" className="sr-only">
            Start date
          </Label>
          <Input
            id="dashboard-start-date"
            type="date"
            value={value.start}
            max={value.end}
            onChange={(e) => onChange({ ...value, start: e.target.value })}
            className="h-9 w-[9.5rem] text-sm"
            aria-label="Start date"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            id="dashboard-end-date"
            type="date"
            value={value.end}
            min={value.start}
            onChange={(e) => onChange({ ...value, end: e.target.value })}
            className="h-9 w-[9.5rem] text-sm"
            aria-label="End date"
          />
        </div>
        <Button type="button" size="sm" className="h-9" onClick={onApply}>
          Apply
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="h-9 w-9"
          onClick={onReset}
          aria-label="Reset date range"
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="dashboard-date-filter rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
        <CalendarRange className="size-4 text-primary" />
        Date range
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex min-w-40 flex-1 flex-col gap-1.5">
          <Label htmlFor="dashboard-start-date">Start date</Label>
          <Input
            id="dashboard-start-date"
            type="date"
            value={value.start}
            max={value.end}
            onChange={(e) => onChange({ ...value, start: e.target.value })}
            className="h-10"
          />
        </div>
        <div className="flex min-w-40 flex-1 flex-col gap-1.5">
          <Label htmlFor="dashboard-end-date">End date</Label>
          <Input
            id="dashboard-end-date"
            type="date"
            value={value.end}
            min={value.start}
            onChange={(e) => onChange({ ...value, end: e.target.value })}
            className="h-10"
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={onApply} className="h-10 px-5">
            Apply
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-10 gap-1.5"
            onClick={onReset}
          >
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
