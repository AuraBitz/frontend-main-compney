import type {
  MenuAvailableStatus,
  MenuCategoryRow,
  MenuItemRow,
} from "@/types/restaurant-ops.types";

export function normalizeAvailableStatus(
  value?: string | null
): MenuAvailableStatus {
  return value === "not_available" ? "not_available" : "available";
}

export function isMenuItemAvailable(
  item: MenuItemRow,
  category?: MenuCategoryRow
): boolean {
  if (normalizeAvailableStatus(category?.available_status) === "not_available") {
    return false;
  }
  return normalizeAvailableStatus(item.available_status) === "available";
}

export function withCategoryAvailability(
  category: MenuCategoryRow
): MenuCategoryRow {
  const categoryUnavailable =
    normalizeAvailableStatus(category.available_status) === "not_available";

  return {
    ...category,
    items: (category.items ?? []).map((item) => ({
      ...item,
      available_status: categoryUnavailable
        ? "not_available"
        : normalizeAvailableStatus(item.available_status),
    })),
  };
}
