"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listQueryForRestaurant } from "@/restaurant-management-admin-panel/lib/project-filters";
import {
  CreateRestaurantFloor,
  GetRestaurantFloorById,
  UpdateRestaurantFloor,
} from "@/services/api/restaurant-floor-master.api";
import {
  CreateRestaurantTable,
  GetRestaurantTableById,
  UpdateRestaurantTable,
} from "@/services/api/restaurant-table-master.api";
import { GetAllRestaurantFloorsList } from "@/services/api/restaurant-floor-master.api";
import type { RestaurantFloorRow } from "@/types/restaurant-ops.types";

interface PortalFloorFormProps {
  mode: "create" | "edit" | "view";
  restaurantId: number;
  recordId?: string;
  onDone?: () => void;
  onCancel: () => void;
  onEdit?: () => void;
}

export function PortalFloorForm({
  mode,
  restaurantId,
  recordId,
  onDone,
  onCancel,
  onEdit,
}: PortalFloorFormProps) {
  const [loading, setLoading] = useState(mode !== "create");
  const [submitting, setSubmitting] = useState(false);
  const [floorNo, setFloorNo] = useState("");
  const [error, setError] = useState("");
  const readOnly = mode === "view";

  useEffect(() => {
    if (mode === "create" || !recordId) {
      setLoading(false);
      return;
    }
    GetRestaurantFloorById(recordId)
      .then((row) => {
        setFloorNo(row.floor_no != null ? String(row.floor_no) : "");
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load floor")
      )
      .finally(() => setLoading(false));
  }, [mode, recordId]);

  const handleSubmit = async () => {
    const parsed = Number(floorNo);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("Enter a valid floor number.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      if (mode === "create") {
        await CreateRestaurantFloor({
          restaurant_id: restaurantId,
          floor_no: parsed,
        });
      } else if (recordId) {
        await UpdateRestaurantFloor(recordId, { floor_no: parsed });
      }
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save floor");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading floor…
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
        <Label htmlFor="floor-no">Floor number</Label>
        <Input
          id="floor-no"
          type="number"
          min={0}
          value={floorNo}
          onChange={(e) => setFloorNo(e.target.value)}
          disabled={readOnly || submitting}
        />
      </div>
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

interface PortalTableFormProps {
  mode: "create" | "edit" | "view";
  restaurantId: number;
  recordId?: string;
  onDone?: () => void;
  onCancel: () => void;
  onEdit?: () => void;
}

export function PortalTableForm({
  mode,
  restaurantId,
  recordId,
  onDone,
  onCancel,
  onEdit,
}: PortalTableFormProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [floors, setFloors] = useState<RestaurantFloorRow[]>([]);
  const [floorId, setFloorId] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [chairCount, setChairCount] = useState("4");
  const [error, setError] = useState("");
  const readOnly = mode === "view";

  useEffect(() => {
    let cancelled = false;
    GetAllRestaurantFloorsList(listQueryForRestaurant(restaurantId))
      .then((result) => {
        if (cancelled) return;
        setFloors(result.rows);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load floors");
      });
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  useEffect(() => {
    if (mode === "create") {
      setLoading(false);
      return;
    }
    if (!recordId) {
      setLoading(false);
      return;
    }
    GetRestaurantTableById(recordId)
      .then((row) => {
        setFloorId(row.floor_id != null ? String(row.floor_id) : "");
        setTableNumber(row.table_number ?? "");
        setChairCount(row.chair_count != null ? String(row.chair_count) : "4");
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load table")
      )
      .finally(() => setLoading(false));
  }, [mode, recordId]);

  const handleSubmit = async () => {
    const parsedFloorId = Number(floorId);
    const parsedChairs = Number(chairCount);
    if (!Number.isFinite(parsedFloorId) || parsedFloorId <= 0) {
      setError("Select a floor.");
      return;
    }
    if (!tableNumber.trim()) {
      setError("Table number is required.");
      return;
    }
    if (!Number.isFinite(parsedChairs) || parsedChairs <= 0) {
      setError("Enter a valid chair count.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        restaurant_id: restaurantId,
        floor_id: parsedFloorId,
        table_number: tableNumber.trim(),
        chair_count: parsedChairs,
        booking_status: "available",
      };
      if (mode === "create") {
        await CreateRestaurantTable(payload);
      } else if (recordId) {
        await UpdateRestaurantTable(recordId, {
          floor_id: parsedFloorId,
          table_number: tableNumber.trim(),
          chair_count: parsedChairs,
        });
      }
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save table");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading table…
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
      {floors.length === 0 && mode === "create" && (
        <p className="text-sm text-muted-foreground">
          Add at least one floor before creating tables.
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="table-floor">Floor</Label>
        <select
          id="table-floor"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={floorId}
          onChange={(e) => setFloorId(e.target.value)}
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
        <Label htmlFor="table-number">Table number</Label>
        <Input
          id="table-number"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          disabled={readOnly || submitting}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="chair-count">Chair count</Label>
        <Input
          id="chair-count"
          type="number"
          min={1}
          value={chairCount}
          onChange={(e) => setChairCount(e.target.value)}
          disabled={readOnly || submitting}
        />
      </div>
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
              disabled={submitting || floors.length === 0}
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
