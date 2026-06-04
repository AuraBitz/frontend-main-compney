import type { ListResult } from "@/lib/list-response";

export interface ListApiObject<T extends object = Record<string, unknown>> {
  list: (body?: unknown) => Promise<ListResult<T>>;
}

export interface SelectedDataKey {
  label: string;
  val: string;
}
