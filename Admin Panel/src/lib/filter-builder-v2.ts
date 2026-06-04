/**
 * Filter Builder V2 (frontend) — maps UI / AG Grid filters to backend list payload.
 */

import { toISODateStringIST } from "@/utils/format-date";

export type FilterOp =
  | "eq"
  | "equals"
  | "ne"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "like"
  | "ilike"
  | "contains"
  | "in"
  | "between"
  | "date_between"
  | "date_equals"
  | "is_null"
  | "is_not_null";

export interface FilterClause {
  op: FilterOp | string;
  value?: unknown;
}

export type ListFilters = Record<string, FilterClause | unknown>;

export interface ListQueryPayload {
  skip?: number;
  limit?: number;
  sort?: { field?: string; order?: string };
  filters?: ListFilters;
}

export function buildFilterClause(
  op: FilterOp | string,
  value: unknown
): FilterClause {
  return { op, value };
}

/** AG Grid text/number filter model → backend clause */
export function agTextFilterToClause(
  model: {
    type?: string;
    filter?: string | number | null;
    filterTo?: string | number | null;
  } | null
): FilterClause | null {
  if (!model || model.filter == null || model.filter === "") return null;

  const type = String(model.type || "contains").toLowerCase();
  const value = model.filter;

  switch (type) {
    case "equals":
      return buildFilterClause("equals", value);
    case "notequal":
    case "notEqual":
      return buildFilterClause("ne", value);
    case "startswith":
      return buildFilterClause("ilike", `${value}%`);
    case "endswith":
      return buildFilterClause("ilike", `%${value}`);
    case "greaterthan":
      return buildFilterClause("gt", value);
    case "lessthan":
      return buildFilterClause("lt", value);
    case "inrange":
      if (model.filterTo != null) {
        return buildFilterClause("between", [value, model.filterTo]);
      }
      return buildFilterClause("equals", value);
    default:
      return buildFilterClause("contains", value);
  }
}

function toDateOnlyInput(value: string): string {
  return toISODateStringIST(value) || value.slice(0, 10);
}

/** AG Grid date filter → backend date_between / date_equals (date only, no time) */
export function agDateFilterToClause(
  model: {
    type?: string;
    dateFrom?: string | null;
    dateTo?: string | null;
  } | null
): FilterClause | null {
  if (!model?.dateFrom) return null;

  const type = String(model.type || "equals").toLowerCase();
  const dateFrom = toDateOnlyInput(model.dateFrom);

  if (type === "inrange" && model.dateTo) {
    const dateTo = toDateOnlyInput(model.dateTo);
    return buildFilterClause("date_between", [dateFrom, dateTo]);
  }

  return buildFilterClause("date_equals", dateFrom);
}

export function agFilterModelToListFilters(
  filterModel: Record<string, unknown> | null | undefined,
  dateFields: string[] = []
): ListFilters {
  if (!filterModel) return {};

  const filters: ListFilters = {};
  const dateSet = new Set(dateFields);

  for (const [field, raw] of Object.entries(filterModel)) {
    if (!raw || typeof raw !== "object") continue;

    const model = raw as Record<string, unknown>;
    const filterType = String(model.filterType || "").toLowerCase();

    let clause: FilterClause | null = null;

    if (filterType === "set") {
      const values = model.values as string[] | undefined;
      if (Array.isArray(values) && values.length === 1) {
        clause = buildFilterClause("equals", values[0]);
      } else if (Array.isArray(values) && values.length > 1) {
        clause = buildFilterClause("in", values);
      }
    } else if (filterType === "date" || dateSet.has(field)) {
      clause = agDateFilterToClause(
        model as { type?: string; dateFrom?: string; dateTo?: string }
      );
    } else {
      clause = agTextFilterToClause(
        model as {
          type?: string;
          filter?: string | number | null;
          filterTo?: string | number | null;
        }
      );
    }

    if (clause) filters[field] = clause;
  }

  return filters;
}
