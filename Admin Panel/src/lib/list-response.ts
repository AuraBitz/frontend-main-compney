import type { BackendSuccessResponse } from "@/services/api/types";

export interface ListMeta {
  total: number;
  skip?: number;
  limit?: number;
  sort?: string;
}

export interface ListResult<T> {
  rows: T[];
  total: number;
  meta?: ListMeta;
}

function parseTotal(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Unwrap backend list payload `{ data, meta: { total } }`. */
export function unwrapListResult<T>(payload: unknown): ListResult<T> {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as BackendSuccessResponse<T[]>).success === true
  ) {
    const body = payload as BackendSuccessResponse<T[]>;
    const rows = Array.isArray(body.data) ? body.data : [];
    const total = parseTotal(body.meta?.total, rows.length);
    return {
      rows,
      total,
      meta: {
        total,
        skip:
          typeof body.meta?.skip === "number"
            ? body.meta.skip
            : undefined,
        limit:
          typeof body.meta?.limit === "number"
            ? body.meta.limit
            : undefined,
        sort:
          typeof body.meta?.sort === "string" ? body.meta.sort : undefined,
      },
    };
  }

  if (Array.isArray(payload)) {
    return { rows: payload as T[], total: payload.length };
  }

  return { rows: [], total: 0 };
}
