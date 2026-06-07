"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Armchair,
  Ban,
  Combine,
  Copy,
  Eye,
  Info,
  Layers,
  Loader2,
  Lock,
  Maximize2,
  Pencil,
  Plus,
  Palette,
  RotateCcw,
  Split,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PortalChildContext } from "@/restaurant-management-admin-panel/hooks/use-portal-child-module";
import { listQueryForRestaurant } from "@/restaurant-management-admin-panel/lib/project-filters";
import { resolveRestaurantId } from "@/restaurant-management-admin-panel/lib/restaurant-portal-scope";
import {
  applyTableSize,
  buildInitialFloors,
  buildMatrixPayload,
  computeFloorCanvasSize,
  ensureFloorChairSlots,
  findBookingsForCanvasTable,
  FLOOR_DESIGNS,
  isMasterLinkedTable,
  isMergedCanvasTable,
  isTableDisabled,
  isTableLocked,
  suggestDuplicateTableNumber,
  loadLiveTablesState,
  mergeTwoTables,
  reconcileFloorsWithMaster,
  refreshLayoutStatusesFromMatrix,
  saveLiveTablesState,
  tableDimensions,
  tableSeatCount,
  unmergeTable,
  type FloorDesignId,
  type LiveCanvasChair,
  type LiveCanvasTable,
  type LiveFloorState,
  type LiveTableStatus,
} from "@/restaurant-management-admin-panel/lib/live-tables-storage";
import { GetAllRestaurantFloorsList } from "@/services/api/restaurant-floor-master.api";
import {
  GetRestaurantLiveTableMatrixByRestaurantId,
  UpsertRestaurantLiveTableMatrix,
} from "@/services/api/restaurant-live-table-matrix-master.api";
import { GetAllRestaurantBookingsList } from "@/services/api/restaurant-booking-master.api";
import {
  CreateRestaurantTable,
  DeleteRestaurantTable,
  GetAllRestaurantTablesList,
  UpdateRestaurantTable,
} from "@/services/api/restaurant-table-master.api";
import type {
  RestaurantBookingRow,
  RestaurantFloorRow,
  RestaurantTableRow,
} from "@/types/restaurant-ops.types";
import {
  formatDateDDMMYYYY,
  formatTimeString12,
} from "@/utils/format-date";
import { useAuth } from "@/store";
import { cn } from "@/lib/utils";

const STATUS_META: Record<
  LiveTableStatus,
  { label: string; dot: string; table: string; glow: string; chip: string }
> = {
  free: {
    label: "FREE",
    dot: "bg-emerald-400 shadow-[0_0_10px_#34d399]",
    table: "from-emerald-400 via-emerald-600 to-emerald-800 border-emerald-200/30",
    glow: "shadow-[0_8px_32px_rgba(16,185,129,0.35)]",
    chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  busy: {
    label: "BOOKED",
    dot: "bg-red-400 shadow-[0_0_10px_#f87171]",
    table: "from-red-500 via-red-700 to-red-900 border-red-300/40",
    glow: "shadow-[0_8px_32px_rgba(220,38,38,0.5)]",
    chip: "bg-red-500/15 text-red-700 dark:text-red-300",
  },
  reserved: {
    label: "RESERVED",
    dot: "bg-amber-400 shadow-[0_0_10px_#fbbf24]",
    table: "from-amber-400 via-amber-600 to-amber-800 border-amber-200/30",
    glow: "shadow-[0_8px_32px_rgba(245,158,11,0.35)]",
    chip: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  },
  selected: {
    label: "SELECTED",
    dot: "bg-sky-300 shadow-[0_0_12px_#7dd3fc]",
    table: "from-sky-400 via-blue-600 to-indigo-800 border-sky-100/50",
    glow: "shadow-[0_0_28px_rgba(56,189,248,0.55)] ring-2 ring-sky-300/70",
    chip: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  },
};

const DISABLED_TABLE_META = {
  label: "DISABLED",
  dot: "bg-zinc-400 shadow-[0_0_8px_#a1a1aa]",
  table: "from-zinc-500 via-zinc-600 to-zinc-800 border-zinc-300/30",
  glow: "shadow-[0_8px_24px_rgba(113,113,122,0.35)] opacity-75",
  chip: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
};

const TABLE_SIZE_MIN = 60;
const TABLE_SIZE_MAX = 420;

function formatBookingStatus(status?: string | null): string {
  const value = (status ?? "pending").toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function BookingInfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/60 py-2.5 last:border-0">
      <span className="shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

type TableFormMode = "create" | "edit";

function TableFormDialog({
  mode,
  open,
  onOpenChange,
  floorLabel,
  initialTableNumber = "",
  initialChairCount = "4",
  onSubmit,
}: {
  mode: TableFormMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  floorLabel: string;
  initialTableNumber?: string;
  initialChairCount?: string;
  onSubmit: (tableNumber: string, chairCount: number) => Promise<void>;
}) {
  const [tableNumber, setTableNumber] = useState("");
  const [chairCount, setChairCount] = useState("4");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTableNumber(initialTableNumber);
    setChairCount(initialChairCount);
    setError("");
    setSubmitting(false);
  }, [open, initialTableNumber, initialChairCount]);

  const handleSubmit = async () => {
    const trimmed = tableNumber.trim();
    const parsedChairs = Number(chairCount);
    if (!trimmed) {
      setError("Table number is required.");
      return;
    }
    if (!Number.isFinite(parsedChairs) || parsedChairs < 1) {
      setError("Enter a valid chair count (minimum 1).");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(trimmed, parsedChairs);
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : mode === "edit"
            ? "Failed to update table"
            : "Failed to create table"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? `Edit table on ${floorLabel}` : `Create table on ${floorLabel}`}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Updates Table Master and refreshes chairs on the canvas."
              : "Table will be added to Table Master and placed on this floor canvas."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="live-table-form-number">Table number</Label>
            <Input
              id="live-table-form-number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. 5, A1, VIP-2"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="live-table-form-chair-count">Chair count</Label>
            <Input
              id="live-table-form-chair-count"
              type="number"
              min={1}
              max={32}
              value={chairCount}
              onChange={(e) => setChairCount(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                {mode === "edit" ? "Saving…" : "Creating…"}
              </>
            ) : mode === "edit" ? (
              <>
                <Pencil className="mr-1.5 size-3.5" />
                Save changes
              </>
            ) : (
              <>
                <Plus className="mr-1.5 size-3.5" />
                Create table
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteTableDialog({
  open,
  onOpenChange,
  tableLabel,
  isMerged,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableLabel: string;
  isMerged: boolean;
  onConfirm: () => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setSubmitting(false);
    setError("");
  }, [open]);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError("");
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete table");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isMerged ? `Remove ${tableLabel} from layout?` : `Delete table ${tableLabel}?`}
          </DialogTitle>
          <DialogDescription>
            {isMerged
              ? "This removes the merged table from the canvas. Underlying tables in Table Master stay unchanged."
              : "This deletes the table from Table Master and removes it from the live floor layout."}
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="mr-1.5 size-3.5" />
                {isMerged ? "Remove from layout" : "Delete table"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TableBookingInfoDialog({
  open,
  onOpenChange,
  tableLabel,
  bookings,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableLabel: string;
  bookings: RestaurantBookingRow[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Booking — Table {tableLabel}</DialogTitle>
          <DialogDescription>
            {bookings.length > 1
              ? `${bookings.length} active bookings linked to this table`
              : "Active booking details for this table"}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto">
          {bookings.length === 0 ? (
            <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              No active booking found for this table.
            </p>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-xl border bg-muted/30 p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Booking #{booking.id}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase",
                      (booking.booking_status ?? "").toLowerCase() === "completed"
                        ? "bg-red-500/15 text-red-700 dark:text-red-300"
                        : (booking.booking_status ?? "").toLowerCase() === "confirmed" ||
                            (booking.booking_status ?? "").toLowerCase() === "pending"
                          ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {formatBookingStatus(booking.booking_status)}
                  </span>
                </div>
                <BookingInfoRow
                  label="Customer"
                  value={booking.customer_name?.trim() || "Guest"}
                />
                <BookingInfoRow
                  label="Phone"
                  value={booking.customer_phone?.trim() || "—"}
                />
                <BookingInfoRow
                  label="Date"
                  value={
                    booking.booking_date
                      ? formatDateDDMMYYYY(booking.booking_date)
                      : "—"
                  }
                />
                <BookingInfoRow
                  label="Time"
                  value={
                    booking.booking_time
                      ? formatTimeString12(booking.booking_time)
                      : "—"
                  }
                />
                <BookingInfoRow
                  label="Guests"
                  value={booking.persons_count ?? "—"}
                />
                <BookingInfoRow
                  label="Floor"
                  value={
                    booking.floor_no != null ? `Floor ${booking.floor_no}` : "—"
                  }
                />
                <BookingInfoRow
                  label="Table"
                  value={booking.table_number ?? tableLabel}
                />
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LiveTableNode({
  table,
  selected,
  mergeTarget,
  isMergeSource,
  locked,
  hasBookingInfo,
  zIndex,
  isDragging,
  liveX,
  liveY,
  liveWidth,
  liveHeight,
  selectedTableChairId,
  onSelect,
  onDragStart,
  onTableChairSelect,
  onResizeStart,
  onInfoClick,
}: {
  table: LiveCanvasTable;
  selected: boolean;
  mergeTarget: boolean;
  isMergeSource: boolean;
  locked: boolean;
  hasBookingInfo?: boolean;
  zIndex: number;
  isDragging: boolean;
  liveX?: number;
  liveY?: number;
  liveWidth?: number;
  liveHeight?: number;
  selectedTableChairId: string | null;
  onSelect: () => void;
  onDragStart: (e: React.PointerEvent) => void;
  onTableChairSelect: (chairId: string) => void;
  onResizeStart: (e: React.PointerEvent) => void;
  onInfoClick?: () => void;
}) {
  const displayStatus = locked ? table.status : selected ? "selected" : table.status;
  const disabled = isTableDisabled(table) && !locked;
  const meta = disabled ? DISABLED_TABLE_META : STATUS_META[displayStatus];
  const baseDim = tableDimensions(table);
  const width = liveWidth ?? baseDim.width;
  const height = liveHeight ?? baseDim.height;
  const x = liveX ?? table.x;
  const y = liveY ?? table.y;
  const chairs = table.chairSlots ?? [];
  const seatCount = tableSeatCount(table);
  const isMerged = (table.mergeSegments ?? 1) > 1;
  const partCount = table.mergedParts?.length ?? (isMerged ? 2 : 1);

  return (
    <div
      className={cn(
        "absolute touch-none select-none",
        !isDragging && "transition-shadow duration-150",
        mergeTarget && !locked && "animate-pulse ring-2 ring-violet-400/80 ring-offset-2 ring-offset-transparent",
        isMergeSource && "pointer-events-none opacity-40",
        locked && "cursor-not-allowed"
      )}
      style={{
        left: x,
        top: y,
        width,
        height,
        zIndex: isDragging ? 200 : zIndex,
      }}
    >
      {chairs.map((chair) => (
        <button
          key={chair.id}
          type="button"
          className={cn(
            "absolute rounded-md shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_3px_6px_rgba(0,0,0,0.4)]",
            locked
              ? "pointer-events-none bg-gradient-to-b from-[#4a3020] to-[#1a1008] opacity-90"
              : "cursor-pointer bg-gradient-to-b from-[#5a3d2a] to-[#2d1c12] hover:brightness-110",
            selectedTableChairId === chair.id && "ring-2 ring-sky-400 ring-offset-1 ring-offset-[#1a120d]"
          )}
          style={{ left: chair.relX, top: chair.relY, width: chair.w, height: chair.h }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (locked) return;
            onTableChairSelect(chair.id);
          }}
        />
      ))}

      <div
        className={cn(
          "relative flex h-full w-full flex-col items-center justify-between overflow-hidden border bg-gradient-to-br px-2 py-2 text-white backdrop-blur-sm",
          meta.table,
          meta.glow,
          disabled && "opacity-80 saturate-50",
          isMerged ? "rounded-3xl" : "rounded-2xl",
          locked && "opacity-95 saturate-110",
          !locked && "cursor-grab active:cursor-grabbing"
        )}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (isMergeSource) return;
          onSelect();
          if (!locked) onDragStart(e);
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22)_0%,transparent_45%,rgba(0,0,0,0.12)_100%)]" />
        {isMerged && partCount > 1
          ? Array.from({ length: partCount - 1 }, (_, i) => (
              <div
                key={i}
                className="pointer-events-none absolute top-3 bottom-3 w-0.5 bg-white/30"
                style={{ left: `${((i + 1) / partCount) * 100}%` }}
              />
            ))
          : null}
        {locked && hasBookingInfo && onInfoClick ? (
          <button
            type="button"
            title="Booking information"
            className="absolute left-1.5 top-1.5 z-20 rounded-full bg-black/35 p-1 transition hover:bg-black/55"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onInfoClick();
            }}
          >
            <Info className="size-3 text-white/90" />
          </button>
        ) : null}
        {disabled ? (
          <div className="absolute right-1.5 top-1.5 z-20 rounded-full bg-black/35 p-1">
            <Ban className="size-3 text-white/90" />
          </div>
        ) : locked ? (
          <div className="absolute right-1.5 top-1.5 z-20 rounded-full bg-black/35 p-1">
            <Lock className="size-3 text-white/90" />
          </div>
        ) : null}

        <span className="relative z-10 max-w-[95%] truncate text-base font-bold tracking-wide drop-shadow-md">
          {table.label}
        </span>
        <div className="relative z-10 flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-0.5 text-[11px] text-white/95">
          <Armchair className="size-3.5" />
          <span className="font-semibold">
            {seatCount}
            {seatCount !== table.capacity ? (
              <span className="text-white/60">/{table.capacity}</span>
            ) : null}
          </span>
          {isMerged ? (
            <span className="ml-1 rounded bg-white/25 px-1.5 text-[9px] font-bold">
              MERGED
            </span>
          ) : null}
        </div>
        <div className="relative z-10 flex items-center gap-1.5">
          <span className={cn("size-2.5 rounded-full", meta.dot)} />
          <span className="text-[10px] font-bold tracking-widest">{meta.label}</span>
        </div>
      </div>

      {selected && !locked ? (
        <div
          className="absolute bottom-1 right-1 z-30 flex size-5 cursor-se-resize items-center justify-center rounded-md border border-white/30 bg-sky-500/90 shadow-lg"
          onPointerDown={(e) => {
            e.stopPropagation();
            onResizeStart(e);
          }}
        >
          <Maximize2 className="size-3 rotate-90 text-white" />
        </div>
      ) : null}
    </div>
  );
}

function ChairNode({
  chair,
  selected,
  isDragging,
  liveX,
  liveY,
  onSelect,
  onPointerDown,
}: {
  chair: LiveCanvasChair;
  selected: boolean;
  isDragging: boolean;
  liveX?: number;
  liveY?: number;
  onSelect: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  const x = liveX ?? chair.x;
  const y = liveY ?? chair.y;

  return (
    <div
      className="absolute touch-none select-none"
      style={{
        left: x,
        top: y,
        zIndex: isDragging ? 220 : selected ? 120 : 100,
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect();
        onPointerDown(e);
      }}
    >
      <div className="relative p-2">
        <div
          className={cn(
            "h-4 w-7 rounded-md bg-gradient-to-b from-[#5a3d2a] to-[#2d1c12] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_3px_6px_rgba(0,0,0,0.4)]",
            selected && "ring-2 ring-sky-400 ring-offset-2 ring-offset-[#1a120d]"
          )}
        />
        {selected ? (
          <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-sky-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white">
            Chair
          </span>
        ) : null}
      </div>
    </div>
  );
}

interface PortalLiveTablesProps {
  ctx: PortalChildContext;
}

export function PortalLiveTables({ ctx }: PortalLiveTablesProps) {
  const { user } = useAuth();
  const restaurantId = resolveRestaurantId(ctx.session, user);
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);
  const renderScaleRef = useRef(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [masterTables, setMasterTables] = useState<RestaurantTableRow[]>([]);
  const [apiFloors, setApiFloors] = useState<RestaurantFloorRow[]>([]);
  const [bookings, setBookings] = useState<RestaurantBookingRow[]>([]);
  const [floors, setFloors] = useState<LiveFloorState[]>([]);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingDialogTable, setBookingDialogTable] = useState<LiveCanvasTable | null>(
    null
  );
  const [tableFormOpen, setTableFormOpen] = useState(false);
  const [tableFormMode, setTableFormMode] = useState<TableFormMode>("create");
  const [tableFormTarget, setTableFormTarget] = useState<LiveCanvasTable | null>(null);
  const [deleteTableDialogOpen, setDeleteTableDialogOpen] = useState(false);
  const [deleteTableTarget, setDeleteTableTarget] = useState<LiveCanvasTable | null>(null);
  const [tableActionError, setTableActionError] = useState("");
  const [activeFloorId, setActiveFloorId] = useState("");
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedChairId, setSelectedChairId] = useState<string | null>(null);
  const [selectedTableChairId, setSelectedTableChairId] = useState<string | null>(null);
  const [mergeSourceId, setMergeSourceId] = useState<string | null>(null);
  const [resizeDrag, setResizeDrag] = useState<{
    tableId: string;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);
  const [dragLive, setDragLive] = useState<{
    kind: "table" | "chair";
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [resizeLive, setResizeLive] = useState<{
    tableId: string;
    width: number;
    height: number;
  } | null>(null);
  const [zoom, setZoom] = useState(100);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floorsRef = useRef<LiveFloorState[]>([]);
  const activeFloorIdRef = useRef("");
  const dragLiveRef = useRef(dragLive);
  const resizeLiveRef = useRef(resizeLive);
  dragLiveRef.current = dragLive;
  resizeLiveRef.current = resizeLive;
  const [dragTarget, setDragTarget] = useState<{
    kind: "table" | "chair";
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [pendingDrag, setPendingDrag] = useState<{
    kind: "table" | "chair";
    id: string;
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const activeFloor = useMemo(
    () => floors.find((f) => f.id === activeFloorId) ?? floors[0] ?? null,
    [floors, activeFloorId]
  );

  const floorDesign = activeFloor?.floorDesign ?? "wood";
  const designMeta = FLOOR_DESIGNS[floorDesign];
  const canvasSize = useMemo(
    () => computeFloorCanvasSize(activeFloor),
    [activeFloor]
  );
  const renderScale = fitScale * (zoom / 100);

  renderScaleRef.current = renderScale;

  useEffect(() => {
    const node = canvasViewportRef.current;
    if (!node) return;

    let raf = 0;
    const updateFit = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const cw = node.clientWidth;
        const ch = node.clientHeight;
        if (cw <= 0 || ch <= 0) return;
        const fitW = cw / canvasSize.width;
        const fitH = ch / canvasSize.height;
        const next = Math.min(fitW, fitH);
        setFitScale((prev) => (Math.abs(prev - next) < 0.001 ? prev : next));
      });
    };

    updateFit();
    const observer = new ResizeObserver(updateFit);
    observer.observe(node);
    window.addEventListener("resize", updateFit);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", updateFit);
    };
  }, [canvasSize.width, canvasSize.height]);

  const selectedTable = useMemo(
    () => activeFloor?.tables.find((t) => t.id === selectedTableId) ?? null,
    [activeFloor, selectedTableId]
  );

  const selectedTableLocked = selectedTable ? isTableLocked(selectedTable) : false;
  const selectedTableIsMerged = selectedTable ? isMergedCanvasTable(selectedTable) : false;
  const selectedTableIsMasterLinked = selectedTable
    ? isMasterLinkedTable(selectedTable)
    : false;
  const selectedTableBookings = useMemo(
    () =>
      selectedTable ? findBookingsForCanvasTable(selectedTable, bookings) : [],
    [selectedTable, bookings]
  );
  const bookingDialogBookings = useMemo(
    () =>
      bookingDialogTable
        ? findBookingsForCanvasTable(bookingDialogTable, bookings)
        : [],
    [bookingDialogTable, bookings]
  );

  const openBookingInfo = useCallback((table: LiveCanvasTable) => {
    setBookingDialogTable(table);
    setBookingDialogOpen(true);
  }, []);

  useEffect(() => {
    floorsRef.current = floors;
    activeFloorIdRef.current = activeFloorId;
  }, [floors, activeFloorId]);

  const persist = useCallback(
    (nextFloors: LiveFloorState[], nextActiveId: string, immediate = false) => {
      if (!restaurantId) return;
      const payload = buildMatrixPayload(nextFloors, nextActiveId);
      saveLiveTablesState(restaurantId, payload);

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      const saveToApi = () => {
        UpsertRestaurantLiveTableMatrix(restaurantId, payload).catch(() => {
          /* keep local cache; retry on next change */
        });
      };
      if (immediate) {
        saveToApi();
      } else {
        saveTimerRef.current = setTimeout(saveToApi, 450);
      }
    },
    [restaurantId]
  );

  useEffect(
    () => () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    },
    []
  );

  const switchFloor = useCallback(
    (floorId: string) => {
      setActiveFloorId(floorId);
      setSelectedTableId(null);
      setSelectedChairId(null);
      setMergeSourceId(null);
      persist(floors, floorId);
    },
    [floors, persist]
  );

  const updateFloors = useCallback(
    (updater: (prev: LiveFloorState[]) => LiveFloorState[]) => {
      setFloors((prev) => {
        const next = updater(prev);
        persist(next, activeFloorId || next[0]?.id || "");
        return next;
      });
    },
    [activeFloorId, persist]
  );

  const updateActiveFloor = useCallback(
    (updater: (floor: LiveFloorState) => LiveFloorState) => {
      if (!activeFloor) return;
      updateFloors((prev) =>
        prev.map((f) => (f.id === activeFloor.id ? updater(f) : f))
      );
    },
    [activeFloor, updateFloors]
  );

  const applyMasterReconcile = useCallback(
    (
      currentFloors: LiveFloorState[],
      tables: RestaurantTableRow[],
      apiFloors: RestaurantFloorRow[]
    ) => reconcileFloorsWithMaster(currentFloors, apiFloors, tables),
    []
  );

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const query = listQueryForRestaurant(restaurantId);

    Promise.all([
      GetAllRestaurantFloorsList(query),
      GetAllRestaurantTablesList(query),
      GetAllRestaurantBookingsList(query).catch(() => ({ rows: [] })),
      GetRestaurantLiveTableMatrixByRestaurantId(restaurantId).catch(() => null),
    ])
      .then(([floorResult, tableResult, bookingResult, matrixResult]) => {
        if (cancelled) return;
        setMasterTables(tableResult.rows);
        setApiFloors(floorResult.rows);
        setBookings(bookingResult.rows ?? []);

        const matrixData = matrixResult?.matrix;
        const localSaved = loadLiveTablesState(restaurantId);
        const saved =
          matrixData?.floors?.length
            ? matrixData
            : localSaved?.floors?.length
              ? localSaved
              : null;

        let initialFloors: LiveFloorState[];
        if (saved?.floors?.length) {
          initialFloors = applyMasterReconcile(
            saved.floors,
            tableResult.rows,
            floorResult.rows
          );
        } else {
          initialFloors = buildInitialFloors(floorResult.rows, tableResult.rows).map(
            ensureFloorChairSlots
          );
        }

        setFloors(initialFloors);
        const activeId =
          saved?.activeFloorId && initialFloors.some((f) => f.id === saved.activeFloorId)
            ? saved.activeFloorId
            : initialFloors[0]?.id || "";
        setActiveFloorId(activeId);
        persist(initialFloors, activeId, true);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load layout");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [restaurantId, persist, applyMasterReconcile]);

  useEffect(() => {
    if (!restaurantId || loading || !apiFloors.length) return undefined;

    const pollMatrix = async () => {
      if (dragTarget || pendingDrag || resizeDrag) return;

      try {
        const query = listQueryForRestaurant(restaurantId);
        const [tableResult, bookingResult, matrixResult] = await Promise.all([
          GetAllRestaurantTablesList(query),
          GetAllRestaurantBookingsList(query).catch(() => ({ rows: [] })),
          GetRestaurantLiveTableMatrixByRestaurantId(restaurantId).catch(() => null),
        ]);

        const matrixData = matrixResult?.matrix;
        if (!matrixData?.floors?.length) return;

        setMasterTables(tableResult.rows);
        setBookings(bookingResult.rows ?? []);
        setFloors((prev) =>
          refreshLayoutStatusesFromMatrix(
            prev,
            matrixData.floors,
            apiFloors,
            tableResult.rows
          )
        );
      } catch {
        /* ignore poll errors */
      }
    };

    const timer = setInterval(pollMatrix, 3000);
    return () => clearInterval(timer);
  }, [
    restaurantId,
    loading,
    apiFloors,
    dragTarget,
    pendingDrag,
    resizeDrag,
  ]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      let active = dragTarget;

      if (!active && pendingDrag) {
        const dx = e.clientX - pendingDrag.startX;
        const dy = e.clientY - pendingDrag.startY;
        if (Math.hypot(dx, dy) >= 6) {
          active = {
            kind: pendingDrag.kind,
            id: pendingDrag.id,
            offsetX: pendingDrag.offsetX,
            offsetY: pendingDrag.offsetY,
          };
          setDragTarget(active);
          setPendingDrag(null);
        } else {
          return;
        }
      }

      if (!active) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scale = renderScaleRef.current;
      const x = Math.max(8, (e.clientX - rect.left) / scale - active.offsetX);
      const y = Math.max(8, (e.clientY - rect.top) / scale - active.offsetY);

      setDragLive({ kind: active.kind, id: active.id, x, y });
    };

    const onUp = () => {
      const live = dragLiveRef.current;
      if (live) {
        const currentFloors = floorsRef.current;
        const currentActiveId = activeFloorIdRef.current;
        const nextFloors = currentFloors.map((floor) => {
          if (floor.id !== currentActiveId) return floor;
          if (live.kind === "table") {
            const t = floor.tables.find((tb) => tb.id === live.id);
            if (!t || isTableLocked(t)) return floor;
            return {
              ...floor,
              tables: floor.tables.map((tb) =>
                tb.id === live.id ? { ...tb, x: live.x, y: live.y } : tb
              ),
            };
          }
          return {
            ...floor,
            chairs: floor.chairs.map((c) =>
              c.id === live.id ? { ...c, x: live.x, y: live.y } : c
            ),
          };
        });
        setFloors(nextFloors);
        persist(nextFloors, currentActiveId);
      }
      setDragLive(null);
      setDragTarget(null);
      setPendingDrag(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragTarget, pendingDrag, persist]);

  useEffect(() => {
    if (!resizeDrag) return;

    const onMove = (e: PointerEvent) => {
      const scale = renderScaleRef.current;
      const dx = (e.clientX - resizeDrag.startX) / scale;
      const dy = (e.clientY - resizeDrag.startY) / scale;
      const nextW = Math.min(
        TABLE_SIZE_MAX,
        Math.max(TABLE_SIZE_MIN, Math.round(resizeDrag.startW + dx))
      );
      const nextH = Math.min(
        TABLE_SIZE_MAX,
        Math.max(TABLE_SIZE_MIN, Math.round(resizeDrag.startH + dy))
      );
      setResizeLive({ tableId: resizeDrag.tableId, width: nextW, height: nextH });
    };

    const onUp = () => {
      const live = resizeLiveRef.current;
      if (live) {
        const currentFloors = floorsRef.current;
        const currentActiveId = activeFloorIdRef.current;
        const nextFloors = currentFloors.map((floor) => {
          if (floor.id !== currentActiveId) return floor;
          return {
            ...floor,
            tables: floor.tables.map((tb) =>
              tb.id === live.tableId
                ? applyTableSize(tb, live.width, live.height)
                : tb
            ),
          };
        });
        setFloors(nextFloors);
        persist(nextFloors, currentActiveId);
      }
      setResizeLive(null);
      setResizeDrag(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [resizeDrag, zoom, persist]);

  const executeMerge = useCallback(
    (sourceId: string, targetId: string) => {
      if (sourceId === targetId) return;
      const source = activeFloor?.tables.find((t) => t.id === sourceId);
      const target = activeFloor?.tables.find((t) => t.id === targetId);
      if (!source || !target) return;
      if (isTableLocked(source) || isTableLocked(target)) return;

      const merged = mergeTwoTables(source, target);
      updateActiveFloor((floor) => ({
        ...floor,
        tables: floor.tables
          .filter((t) => t.id !== source.id && t.id !== target.id)
          .concat(merged),
      }));
      setSelectedTableId(merged.id);
      setMergeSourceId(null);
    },
    [activeFloor, updateActiveFloor]
  );

  const handleTableSelect = (tableId: string) => {
    setSelectedChairId(null);
    setSelectedTableChairId(null);
    const target = activeFloor?.tables.find((t) => t.id === tableId);
    if (!target) return;

    if (mergeSourceId && mergeSourceId !== tableId) {
      executeMerge(mergeSourceId, tableId);
      return;
    }

    setSelectedTableId(tableId);
    if (!mergeSourceId) setMergeSourceId(null);
  };

  const mergeCandidates = useMemo(() => {
    if (!mergeSourceId || !activeFloor) return [];
    return activeFloor.tables.filter(
      (t) => t.id !== mergeSourceId && !isTableLocked(t)
    );
  }, [mergeSourceId, activeFloor]);

  const sortedTablesForRender = useMemo(() => {
    const tables = activeFloor?.tables ?? [];
    return [...tables].sort((a, b) => {
      const score = (t: LiveCanvasTable) => {
        if (mergeSourceId && t.id === mergeSourceId) return 0;
        if (mergeSourceId && t.id !== mergeSourceId && !isTableLocked(t)) return 2;
        return 1;
      };
      return score(a) - score(b);
    });
  }, [activeFloor, mergeSourceId]);

  const handleUnmerge = () => {
    if (!selectedTable || selectedTableLocked) return;
    const split = unmergeTable(selectedTable);
    updateActiveFloor((floor) => ({
      ...floor,
      tables: floor.tables.filter((t) => t.id !== selectedTable.id).concat(split),
    }));
    setSelectedTableId(split[0]?.id ?? null);
  };

  const handleToggleTableDisabled = () => {
    if (!selectedTable || selectedTableLocked || selectedTable.status !== "free") return;
    updateActiveFloor((floor) => ({
      ...floor,
      tables: floor.tables.map((tb) =>
        tb.id === selectedTable.id ? { ...tb, isDisabled: !tb.isDisabled } : tb
      ),
    }));
  };

  const refreshTablesOnCanvas = useCallback(
    async (options?: {
      selectTableId?: string;
      placeNear?: { x: number; y: number; offset?: number };
    }) => {
      if (!restaurantId) return;
      const query = listQueryForRestaurant(restaurantId);
      const tableResult = await GetAllRestaurantTablesList(query);
      setMasterTables(tableResult.rows);
      updateFloors((prev) => {
        let next = applyMasterReconcile(prev, tableResult.rows, apiFloors);
        if (options?.selectTableId && options.placeNear) {
          const offset = options.placeNear.offset ?? 48;
          next = next.map((floor) => ({
            ...floor,
            tables: floor.tables.map((table) =>
              table.id === options.selectTableId
                ? {
                    ...table,
                    x: options.placeNear!.x + offset,
                    y: options.placeNear!.y + offset,
                  }
                : table
            ),
          }));
        }
        return next;
      });
      if (options?.selectTableId) {
        setSelectedTableId(options.selectTableId);
        setSelectedChairId(null);
        setSelectedTableChairId(null);
        setMergeSourceId(null);
      }
    },
    [restaurantId, apiFloors, applyMasterReconcile, updateFloors]
  );

  const assertTableNumberAvailable = useCallback(
    (tableNumber: string, floorId: number, excludeTableId?: number) => {
      const duplicate = masterTables.some(
        (table) =>
          Number(table.floor_id) === Number(floorId) &&
          String(table.table_number).trim() === tableNumber &&
          (excludeTableId == null || table.id !== excludeTableId)
      );
      if (duplicate) {
        throw new Error(`Table "${tableNumber}" already exists on this floor.`);
      }
    },
    [masterTables]
  );

  const openCreateTableForm = useCallback(() => {
    setTableFormMode("create");
    setTableFormTarget(null);
    setTableFormOpen(true);
  }, []);

  const openEditTableForm = useCallback((table: LiveCanvasTable) => {
    setTableFormMode("edit");
    setTableFormTarget(table);
    setTableFormOpen(true);
  }, []);

  const openDeleteTableDialog = useCallback((table: LiveCanvasTable) => {
    setDeleteTableTarget(table);
    setDeleteTableDialogOpen(true);
  }, []);

  const runTableAction = useCallback(async (action: () => Promise<void>) => {
    setTableActionError("");
    try {
      await action();
    } catch (err) {
      setTableActionError(err instanceof Error ? err.message : "Action failed");
    }
  }, []);

  const handleSyncFromMaster = () => {
    if (!restaurantId) return;
    const query = listQueryForRestaurant(restaurantId);
    Promise.all([
      GetAllRestaurantFloorsList(query),
      GetAllRestaurantTablesList(query),
    ]).then(([floorResult, tableResult]) => {
      setApiFloors(floorResult.rows);
      setMasterTables(tableResult.rows);
      updateFloors((prev) =>
        applyMasterReconcile(prev, tableResult.rows, floorResult.rows)
      );
    });
  };

  const handleTableFormSubmit = useCallback(
    async (tableNumber: string, chairCount: number) => {
      if (!restaurantId || !activeFloor?.floorId) {
        throw new Error("Select a floor before saving the table.");
      }

      if (tableFormMode === "edit") {
        if (!tableFormTarget?.sourceTableId) {
          throw new Error("Only master-linked tables can be edited.");
        }
        if (isTableLocked(tableFormTarget)) {
          throw new Error("Booked or reserved tables cannot be edited.");
        }
        assertTableNumberAvailable(
          tableNumber,
          activeFloor.floorId,
          tableFormTarget.sourceTableId
        );
        await UpdateRestaurantTable(tableFormTarget.sourceTableId, {
          table_number: tableNumber,
          chair_count: chairCount,
        });
        await refreshTablesOnCanvas({ selectTableId: tableFormTarget.id });
        return;
      }

      assertTableNumberAvailable(tableNumber, activeFloor.floorId);
      const created = await CreateRestaurantTable({
        restaurant_id: restaurantId,
        floor_id: activeFloor.floorId,
        table_number: tableNumber,
        chair_count: chairCount,
        booking_status: "available",
      });

      const createdId =
        created && typeof created === "object" && "id" in created
          ? Number((created as RestaurantTableRow).id)
          : null;

      await refreshTablesOnCanvas({
        selectTableId: createdId ? `master-${createdId}` : undefined,
      });
    },
    [
      restaurantId,
      activeFloor,
      tableFormMode,
      tableFormTarget,
      assertTableNumberAvailable,
      refreshTablesOnCanvas,
    ]
  );

  const handleDuplicateTable = useCallback(
    async (table: LiveCanvasTable) => {
      if (!restaurantId || !activeFloor?.floorId) {
        throw new Error("Select a floor before duplicating a table.");
      }
      if (!isMasterLinkedTable(table)) {
        throw new Error("Only single master tables can be duplicated.");
      }
      if (isTableLocked(table)) {
        throw new Error("Booked or reserved tables cannot be duplicated.");
      }

      const tableNumber = suggestDuplicateTableNumber(
        table.label,
        activeFloor.floorId,
        masterTables
      );

      const created = await CreateRestaurantTable({
        restaurant_id: restaurantId,
        floor_id: activeFloor.floorId,
        table_number: tableNumber,
        chair_count: table.capacity,
        booking_status: "available",
      });

      const createdId =
        created && typeof created === "object" && "id" in created
          ? Number((created as RestaurantTableRow).id)
          : null;

      await refreshTablesOnCanvas({
        selectTableId: createdId ? `master-${createdId}` : undefined,
        placeNear: { x: table.x, y: table.y },
      });
    },
    [restaurantId, activeFloor, masterTables, refreshTablesOnCanvas]
  );

  const handleConfirmDeleteTable = useCallback(async () => {
    if (!deleteTableTarget) return;

    if (isMergedCanvasTable(deleteTableTarget)) {
      updateActiveFloor((floor) => ({
        ...floor,
        tables: floor.tables.filter((table) => table.id !== deleteTableTarget.id),
      }));
      setSelectedTableId(null);
      setSelectedTableChairId(null);
      setMergeSourceId(null);
      return;
    }

    if (!deleteTableTarget.sourceTableId) {
      throw new Error("This table is not linked to Table Master.");
    }
    if (isTableLocked(deleteTableTarget)) {
      throw new Error("Booked or reserved tables cannot be deleted.");
    }
    if (findBookingsForCanvasTable(deleteTableTarget, bookings).length > 0) {
      throw new Error("Cancel active bookings before deleting this table.");
    }

    await DeleteRestaurantTable(deleteTableTarget.sourceTableId);
    setSelectedTableId(null);
    setSelectedTableChairId(null);
    await refreshTablesOnCanvas();
  }, [
    deleteTableTarget,
    bookings,
    updateActiveFloor,
    refreshTablesOnCanvas,
  ]);

  const handleFloorDesignChange = (design: FloorDesignId) => {
    updateActiveFloor((floor) => ({ ...floor, floorDesign: design }));
  };

  const addChair = () => {
    if (!activeFloor) return;
    const chair: LiveCanvasChair = {
      id: `chair-${Date.now()}`,
      x: 160,
      y: 160,
    };
    updateActiveFloor((floor) => ({
      ...floor,
      chairs: [...floor.chairs, chair],
    }));
    setSelectedChairId(chair.id);
    setSelectedTableId(null);
  };

  const handleDeleteChair = useCallback(
    (chairId?: string) => {
      const id = chairId ?? selectedChairId;
      if (!id) return;
      updateActiveFloor((floor) => ({
        ...floor,
        chairs: floor.chairs.filter((c) => c.id !== id),
      }));
      setSelectedChairId(null);
    },
    [selectedChairId, updateActiveFloor]
  );

  const handleDeleteTableChair = useCallback(
    (chairId?: string) => {
      const id = chairId ?? selectedTableChairId;
      if (!id || !selectedTableId) return;
      const table = activeFloor?.tables.find((t) => t.id === selectedTableId);
      if (!table || isTableLocked(table)) return;

      updateActiveFloor((floor) => ({
        ...floor,
        tables: floor.tables.map((tb) =>
          tb.id === selectedTableId
            ? {
                ...tb,
                chairSlots: (tb.chairSlots ?? []).filter((c) => c.id !== id),
              }
            : tb
        ),
      }));
      setSelectedTableChairId(null);
    },
    [selectedTableChairId, selectedTableId, activeFloor, updateActiveFloor]
  );

  const handleTableResize = useCallback(
    (width: number, height: number) => {
      if (!selectedTableId || selectedTableLocked) return;
      updateActiveFloor((floor) => ({
        ...floor,
        tables: floor.tables.map((tb) =>
          tb.id === selectedTableId ? applyTableSize(tb, width, height) : tb
        ),
      }));
    },
    [selectedTableId, selectedTableLocked, updateActiveFloor]
  );

  const beginTableResize = useCallback(
    (tableId: string) => (e: React.PointerEvent) => {
      const table = activeFloor?.tables.find((t) => t.id === tableId);
      if (!table || isTableLocked(table)) return;
      const { width, height } = tableDimensions(table);
      setResizeDrag({
        tableId,
        startX: e.clientX,
        startY: e.clientY,
        startW: width,
        startH: height,
      });
    },
    [activeFloor]
  );

  const beginPendingDrag = useCallback(
    (kind: "table" | "chair", id: string) => (e: React.PointerEvent) => {
      if (mergeSourceId) return;
      if (kind === "table") {
        const t = activeFloor?.tables.find((tb) => tb.id === id);
        if (t && isTableLocked(t)) return;
      }
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scale = renderScaleRef.current;
      const item =
        kind === "table"
          ? activeFloor?.tables.find((t) => t.id === id)
          : activeFloor?.chairs.find((c) => c.id === id);
      if (!item) return;
      setPendingDrag({
        kind,
        id,
        offsetX: (e.clientX - rect.left) / scale - item.x,
        offsetY: (e.clientY - rect.top) / scale - item.y,
        startX: e.clientX,
        startY: e.clientY,
      });
    },
    [mergeSourceId, activeFloor]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (selectedTableChairId) {
        e.preventDefault();
        handleDeleteTableChair(selectedTableChairId);
      } else if (selectedChairId) {
        e.preventDefault();
        handleDeleteChair(selectedChairId);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    selectedChairId,
    selectedTableChairId,
    handleDeleteChair,
    handleDeleteTableChair,
  ]);

  if (!restaurantId) {
    return (
      <p className="text-sm text-muted-foreground">
        Open a restaurant portal (Check Restaurant) to use Live Tables.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="-m-6 flex h-[calc(100svh-3.5rem)] items-center justify-center bg-muted/30">
        <Loader2 className="size-7 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="-m-6 flex h-[calc(100svh-3.5rem)] min-h-0 flex-col overflow-hidden bg-background">
      {tableActionError ? (
        <p className="shrink-0 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive" role="alert">
          {tableActionError}
        </p>
      ) : null}

      <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-card px-3 py-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {floors.map((floor) => (
            <button
              key={floor.id}
              type="button"
              onClick={() => switchFloor(floor.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium transition-all",
                activeFloor?.id === floor.id
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:border-primary/30"
              )}
            >
              <Layers className="size-3.5 opacity-70" />
              {floor.label}
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[10px]",
                  activeFloor?.id === floor.id ? "bg-white/20" : "bg-muted"
                )}
              >
                {masterTables.filter((t) =>
                  floor.floorId == null
                    ? true
                    : Number(t.floor_id) === Number(floor.floorId)
                ).length}
              </span>
            </button>
          ))}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border bg-background px-2 py-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setZoom((z) => Math.max(60, z - 10))}
            >
              <ZoomOut className="size-3.5" />
            </Button>
            <span className="min-w-10 text-center text-xs font-medium">{zoom}%</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setZoom((z) => Math.min(140, z + 10))}
            >
              <ZoomIn className="size-3.5" />
            </Button>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={openCreateTableForm}
            disabled={!activeFloor?.floorId}
          >
            <Plus className="mr-1.5 size-3.5" />
            Create table
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleSyncFromMaster}>
            <RotateCcw className="mr-1.5 size-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {mergeSourceId ? (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-300/50 bg-violet-500/10 px-4 py-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Combine className="size-4 text-violet-600" />
            <span className="font-medium text-violet-800 dark:text-violet-200">
              Merge <strong>{activeFloor?.tables.find((t) => t.id === mergeSourceId)?.label}</strong> with:
            </span>
            {mergeCandidates.map((t) => (
              <Button
                key={t.id}
                type="button"
                size="sm"
                variant="outline"
                className="h-8 border-violet-300 bg-white/80 text-violet-900 hover:bg-violet-100"
                onClick={() => executeMerge(mergeSourceId, t.id)}
              >
                {t.label} ({t.capacity} seats)
              </Button>
            ))}
            {mergeCandidates.length === 0 ? (
              <span className="text-xs text-muted-foreground">No free table available</span>
            ) : null}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => setMergeSourceId(null)}>
            Cancel
          </Button>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {selectedTable && !selectedChairId && !selectedTableChairId ? (
            <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-black/55 p-1.5 backdrop-blur-md">
              <span className="px-2 text-xs font-semibold text-white/90">
                {selectedTable.label}
                {selectedTableLocked ? (
                  <Lock className="ml-1.5 inline size-3 text-red-300" />
                ) : null}
              </span>
              {selectedTableIsMasterLinked && !selectedTableLocked ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 text-white hover:bg-white/10"
                    onClick={() => openEditTableForm(selectedTable)}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 text-white hover:bg-white/10"
                    onClick={() => runTableAction(() => handleDuplicateTable(selectedTable))}
                  >
                    <Copy className="size-3.5" />
                    Duplicate
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 text-red-300 hover:bg-red-500/20"
                    onClick={() => openDeleteTableDialog(selectedTable)}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </>
              ) : null}
              {!selectedTableLocked ? (
                <>
                  {selectedTable.status === "free" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "h-7 gap-1 text-white hover:bg-white/10",
                        selectedTable.isDisabled && "text-amber-200"
                      )}
                      onClick={handleToggleTableDisabled}
                    >
                      {selectedTable.isDisabled ? (
                        <>
                          <Eye className="size-3.5" />
                          Enable
                        </>
                      ) : (
                        <>
                          <Ban className="size-3.5" />
                          Disable
                        </>
                      )}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 text-white hover:bg-white/10"
                    onClick={() => setMergeSourceId(selectedTable.id)}
                  >
                    <Combine className="size-3.5" />
                    Merge
                  </Button>
                  {(selectedTable.mergeSegments ?? 1) > 1 ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 text-white hover:bg-white/10"
                      onClick={handleUnmerge}
                    >
                      <Split className="size-3.5" />
                      Unmerge
                    </Button>
                  ) : null}
                </>
              ) : selectedTableLocked ? (
                <span className="px-2 text-[10px] text-red-300">
                  Locked — booked table cannot be edited
                </span>
              ) : null}
              {selectedTableIsMerged ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 text-red-300 hover:bg-red-500/20"
                  onClick={() => openDeleteTableDialog(selectedTable)}
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </Button>
              ) : null}
            </div>
          ) : null}

          {selectedTableChairId && selectedTable ? (
            <div className="absolute left-4 top-4 z-30 flex items-center gap-1.5 rounded-xl border border-sky-400/40 bg-sky-950/80 p-1.5 shadow-lg backdrop-blur-md">
              <Armchair className="ml-1 size-3.5 text-sky-300" />
              <span className="px-1 text-xs font-medium text-white/90">
                {selectedTable.label} chair
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 gap-1 text-red-300 hover:bg-red-500/25"
                onClick={() => handleDeleteTableChair()}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </div>
          ) : null}

          {selectedChairId ? (
            <div className="absolute left-4 top-4 z-30 flex items-center gap-1.5 rounded-xl border border-sky-400/40 bg-sky-950/80 p-1.5 shadow-lg backdrop-blur-md">
              <Armchair className="ml-1 size-3.5 text-sky-300" />
              <span className="px-1 text-xs font-medium text-white/90">
                Chair selected
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 gap-1 text-red-300 hover:bg-red-500/25"
                onClick={() => handleDeleteChair()}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </div>
          ) : null}

          <div ref={canvasViewportRef} className="relative min-h-0 flex-1 overflow-hidden">
            <div
              ref={canvasRef}
              className="absolute left-0 top-0 origin-top-left will-change-transform"
              style={{
                width: canvasSize.width,
                height: canvasSize.height,
                transform: `scale(${renderScale})`,
                background: designMeta.background,
              }}
              onPointerDown={() => {
                if (!mergeSourceId) {
                  setSelectedTableId(null);
                  setSelectedChairId(null);
                  setSelectedTableChairId(null);
                }
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle, ${designMeta.accent} 1px, transparent 1px)`,
                  backgroundSize: "24px 24px",
                  opacity: 0.5,
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.3)_100%)]" />

              {sortedTablesForRender.map((table, index) => {
                const isTableDragging =
                  dragLive?.kind === "table" && dragLive.id === table.id;
                const isTableResizing = resizeLive?.tableId === table.id;
                const tableBookings = findBookingsForCanvasTable(table, bookings);
                return (
                  <LiveTableNode
                    key={table.id}
                    table={table}
                    locked={isTableLocked(table)}
                    hasBookingInfo={tableBookings.length > 0}
                    selected={selectedTableId === table.id}
                    isDragging={isTableDragging || isTableResizing}
                    liveX={isTableDragging ? dragLive?.x : undefined}
                    liveY={isTableDragging ? dragLive?.y : undefined}
                    liveWidth={isTableResizing ? resizeLive?.width : undefined}
                    liveHeight={isTableResizing ? resizeLive?.height : undefined}
                    selectedTableChairId={
                      selectedTableId === table.id ? selectedTableChairId : null
                    }
                    isMergeSource={mergeSourceId === table.id}
                    mergeTarget={
                      !!mergeSourceId &&
                      mergeSourceId !== table.id &&
                      !isTableLocked(table)
                    }
                    zIndex={selectedTableId === table.id ? 50 + index : 10 + index}
                    onSelect={() => handleTableSelect(table.id)}
                    onDragStart={beginPendingDrag("table", table.id)}
                    onTableChairSelect={(chairId) => {
                      setSelectedTableId(table.id);
                      setSelectedTableChairId(chairId);
                      setSelectedChairId(null);
                      setMergeSourceId(null);
                    }}
                    onResizeStart={beginTableResize(table.id)}
                    onInfoClick={
                      tableBookings.length > 0
                        ? () => openBookingInfo(table)
                        : undefined
                    }
                  />
                );
              })}

              {activeFloor?.chairs.map((chair) => {
                const isChairDragging =
                  dragLive?.kind === "chair" && dragLive.id === chair.id;
                return (
                  <ChairNode
                    key={chair.id}
                    chair={chair}
                    selected={selectedChairId === chair.id}
                    isDragging={isChairDragging}
                    liveX={isChairDragging ? dragLive?.x : undefined}
                    liveY={isChairDragging ? dragLive?.y : undefined}
                    onSelect={() => {
                      setSelectedChairId(chair.id);
                      setSelectedTableId(null);
                      setSelectedTableChairId(null);
                      setMergeSourceId(null);
                    }}
                    onPointerDown={beginPendingDrag("chair", chair.id)}
                  />
                );
              })}

              {!activeFloor?.tables.length ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-6 py-4 text-center backdrop-blur-md">
                    <p className="text-sm font-medium text-white/90">
                      No tables on this floor
                    </p>
                    <p className="mt-1 text-xs text-white/50">
                      Use Create table above to add one on this floor
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <aside className="flex w-64 shrink-0 flex-col overflow-hidden border-l bg-gradient-to-b from-card to-muted/20">
          <div className="border-b px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Equipment
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Layout saved to matrix · tables from Master
            </p>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden p-4">
            <section>
              <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold">
                <Plus className="size-3.5 text-primary" />
                Create table
              </p>
              <Button
                type="button"
                size="sm"
                className="w-full gap-1.5"
                onClick={openCreateTableForm}
                disabled={!activeFloor?.floorId}
              >
                <Plus className="size-3.5" />
                Add table on {activeFloor?.label ?? "floor"}
              </Button>
              <p className="mt-1.5 text-[10px] text-muted-foreground">
                Saves to Table Master and places it on the canvas
              </p>
            </section>

            <section>
              <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold">
                <Armchair className="size-3.5 text-primary" />
                Add Chair
              </p>
              <button
                type="button"
                onClick={addChair}
                className="flex w-full items-center gap-3 rounded-xl border border-border/80 bg-background/80 px-3 py-2.5 shadow-sm transition hover:border-primary/50 hover:shadow-md active:scale-[0.98]"
              >
                <div className="h-3 w-6 rounded-sm bg-gradient-to-b from-[#5a3d2a] to-[#2d1c12] shadow" />
                <span className="text-xs font-medium">Place single chair</span>
              </button>
              <p className="mt-1.5 text-[10px] text-muted-foreground">
                Table chairs: click chair on table · Delete key removes it
              </p>
            </section>

            {selectedTableChairId && selectedTable ? (
              <section className="rounded-xl border border-sky-300/50 bg-sky-500/10 p-3">
                <p className="mb-2 text-xs font-semibold text-sky-800 dark:text-sky-200">
                  Table chair — {selectedTable.label}
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={() => handleDeleteTableChair()}
                >
                  <Trash2 className="size-3.5" />
                  Delete table chair
                </Button>
              </section>
            ) : null}

            {selectedChairId ? (
              <section className="rounded-xl border border-sky-300/50 bg-sky-500/10 p-3">
                <p className="mb-2 text-xs font-semibold text-sky-800 dark:text-sky-200">
                  Loose chair
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={() => handleDeleteChair()}
                >
                  <Trash2 className="size-3.5" />
                  Delete chair
                </Button>
              </section>
            ) : null}

            {selectedTable ? (
              <section className="rounded-xl border border-border/80 bg-background/80 p-3">
                <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold">
                  <Pencil className="size-3.5 text-primary" />
                  Table actions — {selectedTable.label}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {selectedTableIsMasterLinked && !selectedTableLocked ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-1.5"
                        onClick={() => openEditTableForm(selectedTable)}
                      >
                        <Pencil className="size-3.5" />
                        Edit table
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-1.5"
                        onClick={() =>
                          runTableAction(() => handleDuplicateTable(selectedTable))
                        }
                      >
                        <Copy className="size-3.5" />
                        Duplicate table
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="w-full justify-start gap-1.5"
                        onClick={() => openDeleteTableDialog(selectedTable)}
                      >
                        <Trash2 className="size-3.5" />
                        Delete table
                      </Button>
                    </>
                  ) : null}
                  {selectedTableIsMerged ? (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="w-full justify-start gap-1.5"
                      onClick={() => openDeleteTableDialog(selectedTable)}
                    >
                      <Trash2 className="size-3.5" />
                      Remove merge
                    </Button>
                  ) : null}
                  {selectedTableLocked ? (
                    <p className="text-[10px] text-muted-foreground">
                      Booked or reserved tables cannot be edited, duplicated, or deleted.
                    </p>
                  ) : null}
                </div>
              </section>
            ) : null}

            {selectedTable && selectedTableLocked && selectedTableBookings.length > 0 ? (
              <section className="rounded-xl border border-amber-300/50 bg-amber-500/10 p-3">
                <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
                  <Info className="size-3.5" />
                  Booking — {selectedTable.label}
                </p>
                <div className="space-y-1 text-xs">
                  <p>
                    <span className="text-muted-foreground">Customer: </span>
                    <span className="font-semibold">
                      {selectedTableBookings[0].customer_name?.trim() || "Guest"}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Phone: </span>
                    <span className="font-semibold">
                      {selectedTableBookings[0].customer_phone?.trim() || "—"}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Status: </span>
                    <span className="font-semibold uppercase">
                      {formatBookingStatus(selectedTableBookings[0].booking_status)}
                    </span>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full gap-1.5"
                  onClick={() => openBookingInfo(selectedTable)}
                >
                  <Info className="size-3.5" />
                  View booking information
                </Button>
              </section>
            ) : null}

            {selectedTable && !selectedTableLocked ? (
              <section className="rounded-xl border border-violet-300/50 bg-violet-500/10 p-3">
                <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-violet-800 dark:text-violet-200">
                  <Maximize2 className="size-3.5" />
                  Table size — {selectedTable.label}
                </p>
                <div className="space-y-3">
                  <label className="block text-[10px] text-muted-foreground">
                    Width: {tableDimensions(selectedTable).width}px
                    <input
                      type="range"
                      min={TABLE_SIZE_MIN}
                      max={TABLE_SIZE_MAX}
                      value={tableDimensions(selectedTable).width}
                      className="mt-1 w-full accent-violet-600"
                      onChange={(e) => {
                        const w = Number(e.target.value);
                        const h = tableDimensions(selectedTable).height;
                        handleTableResize(w, h);
                      }}
                    />
                  </label>
                  <label className="block text-[10px] text-muted-foreground">
                    Height: {tableDimensions(selectedTable).height}px
                    <input
                      type="range"
                      min={TABLE_SIZE_MIN}
                      max={TABLE_SIZE_MAX}
                      value={tableDimensions(selectedTable).height}
                      className="mt-1 w-full accent-violet-600"
                      onChange={(e) => {
                        const h = Number(e.target.value);
                        const w = tableDimensions(selectedTable).width;
                        handleTableResize(w, h);
                      }}
                    />
                  </label>
                  <p className="text-[10px] text-muted-foreground">
                    Drag corner handle on canvas or use sliders above
                  </p>
                </div>
              </section>
            ) : null}

            <section>
              <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold">
                <Palette className="size-3.5 text-primary" />
                Floor Design
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(FLOOR_DESIGNS) as FloorDesignId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleFloorDesignChange(id)}
                    className={cn(
                      "overflow-hidden rounded-xl border p-1.5 text-left transition",
                      floorDesign === id
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <div
                      className="mb-1 h-8 w-full rounded-md border border-black/10"
                      style={{ background: FLOOR_DESIGNS[id].background }}
                    />
                    <span className="text-[10px] font-medium">
                      {FLOOR_DESIGNS[id].label}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Legend
              </p>
              <div className="space-y-1.5">
                {(
                  [
                    ["free", "Free"],
                    ["busy", "Booked"],
                    ["reserved", "Reserved"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2 text-[11px]">
                    <span className={cn("size-2.5 rounded-full", STATUS_META[key].dot)} />
                    <span>{label}</span>
                    {key === "busy" ? <Lock className="size-3 text-muted-foreground" /> : null}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="border-t bg-muted/30 p-4">
            <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <Layers className="size-3.5" />
              Floors
            </p>
            <div className="space-y-1.5">
              {floors.map((floor) => (
                <button
                  key={floor.id}
                  type="button"
                  onClick={() => switchFloor(floor.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs font-medium transition",
                    activeFloor?.id === floor.id
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-transparent bg-background/60 text-muted-foreground hover:border-border"
                  )}
                >
                  <span>{floor.label}</span>
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px]">
                    {masterTables.filter((t) =>
                      floor.floorId == null
                        ? true
                        : Number(t.floor_id) === Number(floor.floorId)
                    ).length}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Add floors in Floor Master, then Refresh
            </p>
          </div>
        </aside>
      </div>

      <TableBookingInfoDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        tableLabel={bookingDialogTable?.label ?? "—"}
        bookings={bookingDialogBookings}
      />

      <TableFormDialog
        mode={tableFormMode}
        open={tableFormOpen}
        onOpenChange={setTableFormOpen}
        floorLabel={activeFloor?.label ?? "this floor"}
        initialTableNumber={
          tableFormMode === "edit" ? tableFormTarget?.label ?? "" : ""
        }
        initialChairCount={
          tableFormMode === "edit"
            ? String(tableFormTarget?.capacity ?? 4)
            : "4"
        }
        onSubmit={handleTableFormSubmit}
      />

      <DeleteTableDialog
        open={deleteTableDialogOpen}
        onOpenChange={setDeleteTableDialogOpen}
        tableLabel={deleteTableTarget?.label ?? "—"}
        isMerged={deleteTableTarget ? isMergedCanvasTable(deleteTableTarget) : false}
        onConfirm={handleConfirmDeleteTable}
      />
    </div>
  );
}
