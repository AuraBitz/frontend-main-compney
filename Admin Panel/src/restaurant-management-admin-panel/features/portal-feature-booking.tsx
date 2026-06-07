"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildFilterClause } from "@/lib/filter-builder-v2";
import { listQueryForRestaurant } from "@/restaurant-management-admin-panel/lib/project-filters";
import { GetAllRestaurantFloorsList } from "@/services/api/restaurant-floor-master.api";
import { GetAllRestaurantTablesList } from "@/services/api/restaurant-table-master.api";
import {
  CreateRestaurantBooking,
  GetRestaurantBookingById,
  UpdateRestaurantBooking,
} from "@/services/api/restaurant-booking-master.api";
import type {
  RestaurantFloorRow,
  RestaurantTableRow,
} from "@/types/restaurant-ops.types";
import {
  formatDateDDMMYYYY,
  formatTimeString12,
} from "@/utils/format-date";

const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
] as const;

interface PortalBookingFormProps {
  mode: "create" | "edit" | "view";
  restaurantId: number;
  recordId?: string;
  onDone?: () => void;
  onCancel: () => void;
  onEdit?: () => void;
}

export function PortalBookingForm({
  mode,
  restaurantId,
  recordId,
  onDone,
  onCancel,
  onEdit,
}: PortalBookingFormProps) {
  const [loading, setLoading] = useState(mode !== "create");
  const [submitting, setSubmitting] = useState(false);
  const [floors, setFloors] = useState<RestaurantFloorRow[]>([]);
  const [tables, setTables] = useState<RestaurantTableRow[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [floorId, setFloorId] = useState("");
  const [tableId, setTableId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingStatus, setBookingStatus] = useState<string>("pending");
  const [isManualBooking, setIsManualBooking] = useState(true);
  const [error, setError] = useState("");
  const readOnly = mode === "view";

  useEffect(() => {
    let cancelled = false;
    GetAllRestaurantFloorsList(listQueryForRestaurant(restaurantId))
      .then((result) => {
        if (!cancelled) setFloors(result.rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load floors");
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
    GetRestaurantBookingById(recordId)
      .then(async (row) => {
        setCustomerName(row.customer_name ?? "");
        setCustomerPhone(row.customer_phone ?? "");
        setBookingDate(
          row.booking_date ? String(row.booking_date).slice(0, 10) : ""
        );
        setBookingTime(row.booking_time ?? "");
        setBookingStatus(row.booking_status ?? "pending");
        setIsManualBooking(row.is_manual_booking === true);
        if (row.floor_id != null) {
          setFloorId(String(row.floor_id));
        }
        if (row.table_id != null) {
          setTableId(String(row.table_id));
        }
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load booking")
      )
      .finally(() => setLoading(false));
  }, [mode, recordId]);

  const handleFloorChange = (value: string) => {
    setFloorId(value);
    setTableId("");
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (!customerPhone.trim()) {
      setError("Customer phone is required.");
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
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        restaurant_id: restaurantId,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        table_id: Number(tableId),
        booking_date: bookingDate || null,
        booking_time: bookingTime.trim() || null,
        booking_status: bookingStatus,
      };
      if (mode === "create") {
        await CreateRestaurantBooking(payload);
      } else if (recordId) {
        await UpdateRestaurantBooking(recordId, payload);
      }
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading booking…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="booking-customer-name">Customer name</Label>
        <Input
          id="booking-customer-name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          disabled={readOnly || submitting}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="booking-customer-phone">Customer phone</Label>
        <Input
          id="booking-customer-phone"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          disabled={readOnly || submitting}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="booking-floor">Floor</Label>
          <select
            id="booking-floor"
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
          <Label htmlFor="booking-table">Table</Label>
          <select
            id="booking-table"
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
                {table.chair_count ? ` (${table.chair_count} chairs)` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="booking-date">Booking date</Label>
          {readOnly ? (
            <p className="flex h-10 items-center rounded-md border border-input bg-muted/30 px-3 text-sm">
              {bookingDate
                ? formatDateDDMMYYYY(bookingDate) || "—"
                : "—"}
            </p>
          ) : (
            <Input
              id="booking-date"
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              disabled={submitting}
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="booking-time">Booking time</Label>
          {readOnly ? (
            <p className="flex h-10 items-center rounded-md border border-input bg-muted/30 px-3 text-sm">
              {bookingTime
                ? formatTimeString12(bookingTime) || "—"
                : "—"}
            </p>
          ) : (
            <Input
              id="booking-time"
              type="time"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              disabled={submitting}
            />
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="booking-status">Booking status</Label>
        <select
          id="booking-status"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm capitalize"
          value={bookingStatus}
          onChange={(e) => setBookingStatus(e.target.value)}
          disabled={readOnly || submitting}
        >
          {BOOKING_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      {readOnly ? (
        <div className="rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Manual booking: </span>
          <span className="font-medium">{isManualBooking ? "Yes" : "No"}</span>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {readOnly ? (
          <>
            <Button type="button" variant="outline" onClick={onCancel}>
              Back
            </Button>
            {onEdit && (
              <Button type="button" onClick={onEdit}>
                Edit
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitting}
            >
              {submitting ? "Saving…" : mode === "create" ? "Create" : "Save"}
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
