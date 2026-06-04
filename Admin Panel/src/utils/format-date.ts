/** Indian Standard Time for all date/time display */
export const IST_TIMEZONE = "Asia/Kolkata";

const DATE_ONLY_FORMAT: Intl.DateTimeFormatOptions = {
  timeZone: IST_TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
};

const TIME_12H_FORMAT: Intl.DateTimeFormatOptions = {
  timeZone: IST_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
};

function parseDate(value: string | Date): Date | null {
  const d = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? null : d;
}

function istTimeParts(d: Date): { h: number; m: number; s: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TIMEZONE,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(d);

  return {
    h: Number(parts.find((p) => p.type === "hour")?.value ?? 0),
    m: Number(parts.find((p) => p.type === "minute")?.value ?? 0),
    s: Number(parts.find((p) => p.type === "second")?.value ?? 0),
  };
}

/** True when value carries a non-midnight time (filters stay date-only) */
export function hasMeaningfulTime(
  value: string | Date | null | undefined
): boolean {
  if (value == null || value === "") return false;

  if (typeof value === "string") {
    const s = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;

    const timeInString = s.match(/[T ]\d{2}:(\d{2})(?::(\d{2}))?/);
    if (timeInString) {
      const h = Number(s.match(/[T ](\d{2}):/)?.[1] ?? 0);
      const m = Number(timeInString[1]);
      const sec = Number(timeInString[2] ?? 0);
      return h !== 0 || m !== 0 || sec !== 0;
    }
  }

  const d = parseDate(value);
  if (!d) return false;
  const { h, m, s } = istTimeParts(d);
  return h !== 0 || m !== 0 || s !== 0;
}

/** Display date as dd-mm-yyyy (IST) */
export function formatDateDDMMYYYY(
  value: string | Date | null | undefined
): string {
  if (value == null || value === "") return "";

  if (typeof value === "string") {
    const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoDate) {
      return `${isoDate[3]}-${isoDate[2]}-${isoDate[1]}`;
    }
  }

  const d = parseDate(value);
  if (!d) return String(value);

  const formatted = new Intl.DateTimeFormat("en-GB", DATE_ONLY_FORMAT).format(
    d
  );
  return formatted.replace(/\//g, "-");
}

/** Time in IST, 12-hour with seconds — e.g. 02:30:45 PM */
export function formatTimeIST12(
  value: string | Date | null | undefined
): string {
  if (value == null || value === "") return "";
  const d = parseDate(value);
  if (!d) return "";

  const parts = new Intl.DateTimeFormat("en-GB", TIME_12H_FORMAT).formatToParts(
    d
  );

  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  const second = parts.find((p) => p.type === "second")?.value ?? "00";
  const dayPeriod = (
    parts.find((p) => p.type === "dayPeriod")?.value ?? "AM"
  ).toUpperCase();

  return `${hour}:${minute}:${second} ${dayPeriod}`;
}

/**
 * Table / data display: dd-mm-yyyy, plus IST time (12h, seconds) when present.
 * Filters use date-only helpers — not this function.
 */
export function formatDateDisplayIST(
  value: string | Date | null | undefined
): string {
  if (value == null || value === "") return "";
  const datePart = formatDateDDMMYYYY(value);
  if (!datePart) return "";
  if (!hasMeaningfulTime(value)) return datePart;
  const timePart = formatTimeIST12(value);
  return timePart ? `${datePart} ${timePart}` : datePart;
}

/** @deprecated Use formatDateDisplayIST */
export function formatDateTimeIST(
  value: string | Date | null | undefined
): string {
  return formatDateDisplayIST(value);
}

/** YYYY-MM-DD in IST — for API / filter payloads */
export function toISODateStringIST(
  value: string | Date | null | undefined
): string {
  if (value == null || value === "") return "";

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const d = parseDate(value);
  if (!d) {
    return String(value).slice(0, 10);
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** @deprecated Use formatDateDDMMYYYY */
export const formatDateOnly = formatDateDDMMYYYY;

/** @deprecated Use formatDateDDMMYYYY */
export function formatDate(iso: string) {
  return formatDateDDMMYYYY(iso);
}
