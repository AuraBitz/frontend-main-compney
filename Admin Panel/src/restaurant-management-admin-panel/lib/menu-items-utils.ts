import type { MenuCategoryRow } from "@/types/restaurant-ops.types";

export function parseMenuItems(raw: unknown): MenuCategoryRow[] {
  if (Array.isArray(raw)) {
    return raw as MenuCategoryRow[];
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as MenuCategoryRow[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function countMenuItems(categories: MenuCategoryRow[]): number {
  return categories.reduce((n, cat) => n + (cat.items?.length ?? 0), 0);
}

export function nextMenuId(items: { id?: number }[]): number {
  const ids = items.map((i) => Number(i.id)).filter(Number.isFinite);
  return ids.length ? Math.max(...ids) + 1 : 1;
}
