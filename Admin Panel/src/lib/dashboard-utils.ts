import { formatDateDDMMYYYY } from "@/utils/format-date";

/** ISO date string YYYY-MM-DD → start of local day */
export function parseStartDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/** ISO date string YYYY-MM-DD → end of local day */
export function parseEndDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}

export function toIsoDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function defaultDateRange(): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);
  return { start: toIsoDateInput(start), end: toIsoDateInput(end) };
}

export function isWithinDateRange(
  iso: string | null | undefined,
  start: Date,
  end: Date
): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export interface ChartPoint {
  label: string;
  count: number;
}

/** Group records by calendar day (local) for bar chart */
export function groupByDay<T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
  start: Date,
  end: Date
): ChartPoint[] {
  const map = new Map<string, number>();
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);

  while (cursor <= endDay) {
    map.set(toIsoDateInput(cursor), 0);
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const item of items) {
    const raw = getDate(item);
    if (!raw) continue;
    const d = new Date(raw);
    if (d < start || d > end) continue;
    const key = toIsoDateInput(d);
    if (map.has(key)) {
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }

  return Array.from(map.entries()).map(([label, count]) => ({
    label: formatChartLabel(label),
    count,
  }));
}

function formatChartLabel(iso: string): string {
  return formatDateDDMMYYYY(iso) || iso;
}
