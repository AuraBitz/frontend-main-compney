"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { buildFilterClause } from "@/lib/filter-builder-v2";
import { listQueryForRestaurant } from "@/restaurant-management-admin-panel/lib/project-filters";
import { GetAllRestaurantCustomersList } from "@/services/api/restaurant-customer-management.api";
import { GetAllRestaurantFloorsList } from "@/services/api/restaurant-floor-master.api";
import { GetAllRestaurantMenusList } from "@/services/api/restaurant-menu-master.api";
import {
  CreateRestaurantOrderMaster,
  GetRestaurantOrderMasterById,
  UpdateRestaurantOrderMaster,
} from "@/services/api/restaurant-order-master.api";
import { GetAllRestaurantTablesList } from "@/services/api/restaurant-table-master.api";
import type {
  RestaurantCustomerRow,
  RestaurantFloorRow,
  RestaurantMenuRow,
  RestaurantOrderMasterRow,
  RestaurantTableRow,
} from "@/types/restaurant-ops.types";
import { formatDateDDMMYYYY } from "@/utils/format-date";
import { cn } from "@/lib/utils";

function encodeMenuOrderItemId(
  thaliId: number,
  categoryId: number,
  itemId: number
): number {
  return thaliId * 1_000_000 + categoryId * 1_000 + itemId;
}

const ORDER_STATUSES = ["pending", "on_dine", "completed"] as const;

function formatOrderStatus(status: string): string {
  if (status === "on_dine") return "On Dine";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

interface MenuItemOption {
  id: number;
  label: string;
  thaliName: string;
  categoryTitle: string;
}

function flattenMenuItems(menus: RestaurantMenuRow[]): MenuItemOption[] {
  const options: MenuItemOption[] = [];
  for (const menu of menus) {
    const thaliId = menu.id;
    if (thaliId == null) continue;
    for (const category of menu.menu_items ?? []) {
      const categoryId = category.id ?? 0;
      for (const item of category.items ?? []) {
        if (item.id == null) continue;
        options.push({
          id: encodeMenuOrderItemId(thaliId, categoryId, item.id),
          label: item.name,
          thaliName: menu.restaurant_thali_name,
          categoryTitle: category.title,
        });
      }
    }
  }
  return options;
}

interface PortalOrderFormProps {
  mode: "create" | "edit" | "view";
  restaurantId: number;
  recordId?: string;
  onDone?: () => void;
  onCancel: () => void;
  onEdit?: () => void;
}

export function PortalOrderForm({
  mode,
  restaurantId,
  recordId,
  onDone,
  onCancel,
  onEdit,
}: PortalOrderFormProps) {
  const [loading, setLoading] = useState(mode !== "create");
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<RestaurantCustomerRow[]>([]);
  const [floors, setFloors] = useState<RestaurantFloorRow[]>([]);
  const [tables, setTables] = useState<RestaurantTableRow[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemOption[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [tableId, setTableId] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [status, setStatus] = useState<string>("pending");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [error, setError] = useState("");
  const readOnly = mode === "view";

  const itemLabelMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const item of menuItems) {
      map.set(item.id, `${item.label} (${item.thaliName})`);
    }
    return map;
  }, [menuItems]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      GetAllRestaurantCustomersList(listQueryForRestaurant(restaurantId)),
      GetAllRestaurantFloorsList(listQueryForRestaurant(restaurantId)),
      GetAllRestaurantMenusList(listQueryForRestaurant(restaurantId)),
    ])
      .then(([customersRes, floorsRes, menusRes]) => {
        if (cancelled) return;
        setCustomers(customersRes.rows);
        setFloors(floorsRes.rows);
        setMenuItems(flattenMenuItems(menusRes.rows));
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load order form data");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  const loadTablesForFloor = useCallback(
    async (selectedFloorId: string) => {
      if (!selectedFloorId) {
        setTables([]);
        return;
      }
      setTablesLoading(true);
      try {
        const result = await GetAllRestaurantTablesList({
          ...listQueryForRestaurant(restaurantId),
          filters: {
            restaurant_id: buildFilterClause("equals", restaurantId),
            floor_id: buildFilterClause("equals", Number(selectedFloorId)),
          },
        });
        setTables(result.rows);
      } catch {
        setTables([]);
      } finally {
        setTablesLoading(false);
      }
    },
    [restaurantId]
  );

  useEffect(() => {
    if (!floorId) {
      setTables([]);
      return;
    }
    void loadTablesForFloor(floorId);
  }, [floorId, loadTablesForFloor]);

  useEffect(() => {
    if (mode === "create" || !recordId) {
      setLoading(false);
      return;
    }
    GetRestaurantOrderMasterById(recordId)
      .then((row: RestaurantOrderMasterRow) => {
        setOrderNumber(row.order_number);
        setCustomerId(row.customer_id != null ? String(row.customer_id) : "");
        setFloorId(row.floor_id != null ? String(row.floor_id) : "");
        setTableId(row.table_id != null ? String(row.table_id) : "");
        setSelectedItemIds(row.order_items_id ?? []);
        setStatus(row.status ?? "pending");
        setCreatedAt(row.created_at ?? null);
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load order")
      )
      .finally(() => setLoading(false));
  }, [mode, recordId]);

  const handleFloorChange = (value: string) => {
    setFloorId(value);
    setTableId("");
  };

  const toggleItem = (itemId: number) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSubmit = async () => {
    if (!customerId) {
      setError("Select a customer.");
      return;
    }
    if (!floorId) {
      setError("Select a floor.");
      return;
    }
    if (!tableId) {
      setError("Select a table.");
      return;
    }
    if (selectedItemIds.length === 0) {
      setError("Select at least one menu item.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const payload = {
        restaurant_id: restaurantId,
        customer_id: Number(customerId),
        floor_id: Number(floorId),
        table_id: Number(tableId),
        order_items_id: selectedItemIds,
        status,
      };
      if (mode === "create") {
        await CreateRestaurantOrderMaster(payload);
      } else if (recordId) {
        await UpdateRestaurantOrderMaster(recordId, payload);
      }
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading order…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {orderNumber != null ? (
        <div className="rounded-lg border border-border/80 bg-muted/20 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Order number
          </p>
          <p className="text-2xl font-bold tabular-nums text-foreground">
            #{orderNumber}
          </p>
        </div>
      ) : null}

      {readOnly && createdAt ? (
        <div className="rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Created: </span>
          <span className="font-medium">
            {formatDateDDMMYYYY(createdAt) || createdAt}
          </span>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="order-customer">Customer</Label>
        <select
          id="order-customer"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          disabled={readOnly || submitting || customers.length === 0}
        >
          <option value="">Select customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={String(customer.id)}>
              {customer.customer_name}
              {customer.phone ? ` · ${customer.phone}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="order-floor">Floor</Label>
          <select
            id="order-floor"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={floorId}
            onChange={(e) => handleFloorChange(e.target.value)}
            disabled={readOnly || submitting || floors.length === 0}
          >
            <option value="">Select floor</option>
            {floors.map((floor) => (
              <option key={floor.id} value={String(floor.id)}>
                Floor {floor.floor_no}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="order-table">Table</Label>
          <select
            id="order-table"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={tableId}
            onChange={(e) => setTableId(e.target.value)}
            disabled={
              readOnly ||
              submitting ||
              !floorId ||
              tablesLoading ||
              tables.length === 0
            }
          >
            <option value="">
              {tablesLoading
                ? "Loading tables…"
                : !floorId
                  ? "Select floor first"
                  : "Select table"}
            </option>
            {tables.map((table) => (
              <option key={table.id} value={String(table.id)}>
                Table {table.table_number}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Order items</Label>
        {readOnly ? (
          <div className="rounded-md border border-input bg-muted/30 px-3 py-3 text-sm">
            {selectedItemIds.length === 0 ? (
              <span className="text-muted-foreground">No items</span>
            ) : (
              <ul className="space-y-1">
                {selectedItemIds.map((itemId) => (
                  <li key={itemId}>
                    {itemLabelMap.get(itemId) ?? `Item #${itemId}`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : menuItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No menu items found. Add menus first.
          </p>
        ) : (
          <div className="max-h-56 space-y-3 overflow-y-auto rounded-md border border-input p-3">
            {menuItems.map((item) => {
              const checked = selectedItemIds.includes(item.id);
              return (
                <label
                  key={item.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    checked && "bg-primary/5"
                  )}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={checked}
                    disabled={submitting}
                    onChange={() => toggleItem(item.id)}
                  />
                  <span>
                    <span className="font-medium">{item.label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {item.thaliName} · {item.categoryTitle}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="order-status">Status</Label>
        <select
          id="order-status"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm capitalize"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={readOnly || submitting}
        >
          {ORDER_STATUSES.map((value) => (
            <option key={value} value={value}>
              {formatOrderStatus(value)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {readOnly ? (
          <>
            <Button type="button" variant="outline" onClick={onCancel}>
              Back
            </Button>
            {onEdit ? (
              <Button type="button" onClick={onEdit}>
                Edit
              </Button>
            ) : null}
          </>
        ) : (
          <>
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitting}
            >
              {submitting ? "Saving…" : mode === "create" ? "Create order" : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export { formatOrderStatus };
