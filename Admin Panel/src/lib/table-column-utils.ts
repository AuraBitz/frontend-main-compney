import type { ColDef } from "ag-grid-community";
import { formatDateDisplayIST, IST_TIMEZONE } from "@/utils/format-date";

function istDayTimestamp(value: string | Date): number | null {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(d);

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);

  if (!year || !month || !day) return null;
  return Date.UTC(year, month - 1, day);
}

/** Apply AG Grid date filter — calendar date only (no time in UI) */
export function withDateColumnFilters<T extends object>(
  columnDefs: ColDef<T>[],
  dateFields: string[] = []
): ColDef<T>[] {
  const dateSet = new Set(dateFields);
  return columnDefs.map((col) => {
    const field = col.field as string | undefined;
    if (!field || !dateSet.has(field)) return col;

    return {
      ...col,
      /** Prevent AG Grid inferring dateTimeString from ISO timestamps (shows time in picker) */
      cellDataType: "dateString",
      filter: "agDateColumnFilter",
      floatingFilter: true,
      valueFormatter: (params) => {
        if (params.value == null || params.value === "") return "—";
        return formatDateDisplayIST(String(params.value)) || "—";
      },
      filterParams: {
        buttons: ["apply", "reset"],
        closeOnApply: true,
        browserDatePicker: true,
        includeTime: false,
        minValidYear: 2000,
        maxValidYear: 2100,
        inRangeFloatingFilterDateFormat: "dd-MM-yyyy",
        inRangeInclusive: true,
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string | null) => {
          if (!cellValue) return -1;

          const filterDay = istDayTimestamp(filterLocalDateAtMidnight);
          const cellDay = istDayTimestamp(cellValue);
          if (filterDay == null || cellDay == null) return -1;

          if (cellDay < filterDay) return -1;
          if (cellDay > filterDay) return 1;
          return 0;
        },
      },
    };
  });
}

/** Status column with Active / Inactive set filter */
export function withStatusSetFilter<T extends object>(
  columnDefs: ColDef<T>[],
  statusField = "status"
): ColDef<T>[] {
  return columnDefs.map((col) => {
    const field = col.field as string | undefined;
    if (field !== statusField) return col;

    return {
      ...col,
      filter: "agSetColumnFilter",
      floatingFilter: true,
      filterParams: {
        values: ["active", "inactive"],
        suppressMiniFilter: true,
      },
      valueFormatter: (params) => {
        const v = String(params.value ?? "").toLowerCase();
        if (v === "active") return "Active";
        if (v === "inactive") return "Inactive";
        return params.value ? String(params.value) : "—";
      },
    };
  });
}
