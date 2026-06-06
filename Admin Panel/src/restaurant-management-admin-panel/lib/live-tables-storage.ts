import type {
  RestaurantBookingRow,
  RestaurantFloorRow,
  RestaurantTableRow,
} from "@/types/restaurant-ops.types";

export type LiveTableStatus = "free" | "busy" | "reserved" | "selected";
export type FloorDesignId = "wood" | "marble" | "tile" | "slate";

export interface MergedTablePart {
  label: string;
  capacity: number;
  sourceTableId?: number;
}

export interface TableChairSlot {
  id: string;
  relX: number;
  relY: number;
  w: number;
  h: number;
}

export interface LiveCanvasTable {
  id: string;
  sourceTableId?: number;
  label: string;
  capacity: number;
  status: LiveTableStatus;
  x: number;
  y: number;
  mergeSegments?: number;
  mergedLabels?: string[];
  mergedParts?: MergedTablePart[];
  /** Visual size after merge — covers both original table footprints */
  mergeSpanW?: number;
  mergeSpanH?: number;
  /** Custom width/height override (resize) */
  sizeW?: number;
  sizeH?: number;
  /** Per-table chair slots — deletable individually */
  chairSlots?: TableChairSlot[];
}

export interface LiveCanvasChair {
  id: string;
  x: number;
  y: number;
}

export interface LiveFloorState {
  id: string;
  floorId: number | null;
  label: string;
  floorNo: number;
  floorDesign?: FloorDesignId;
  tables: LiveCanvasTable[];
  chairs: LiveCanvasChair[];
}

export interface LiveTablesPersisted {
  version?: number;
  floors: LiveFloorState[];
  activeFloorId: string;
}

export const LIVE_TABLE_MATRIX_VERSION = 1;

export const FLOOR_CANVAS_MIN_WIDTH = 900;
export const FLOOR_CANVAS_MIN_HEIGHT = 680;
const FLOOR_CANVAS_PADDING = 96;
const SELECTION_CHROME_PAD = 48;

export function computeFloorCanvasSize(
  floor?: LiveFloorState | null,
  options?: { selectedTableId?: string | null }
): { width: number; height: number } {
  let width = FLOOR_CANVAS_MIN_WIDTH;
  let height = FLOOR_CANVAS_MIN_HEIGHT;
  if (!floor) return { width, height };

  for (const table of floor.tables) {
    const footprint = tableFootprint(table);
    width = Math.max(width, footprint.x + footprint.width + FLOOR_CANVAS_PADDING);
    height = Math.max(height, footprint.y + footprint.height + FLOOR_CANVAS_PADDING);
  }

  for (const chair of floor.chairs) {
    width = Math.max(width, chair.x + 48 + FLOOR_CANVAS_PADDING);
    height = Math.max(height, chair.y + 48 + FLOOR_CANVAS_PADDING);
  }

  if (options?.selectedTableId) {
    const selected = floor.tables.find((t) => t.id === options.selectedTableId);
    if (selected) {
      const footprint = tableFootprint(selected);
      width = Math.max(
        width,
        footprint.x + footprint.width + SELECTION_CHROME_PAD
      );
      height = Math.max(
        height,
        footprint.y + footprint.height + SELECTION_CHROME_PAD
      );
    }
  }

  return { width: Math.ceil(width), height: Math.ceil(height) };
}

export const FLOOR_DESIGNS: Record<
  FloorDesignId,
  { label: string; background: string; accent: string }
> = {
  wood: {
    label: "Wood Planks",
    background:
      "repeating-linear-gradient(90deg, #6b4a38 0px, #6b4a38 44px, #543628 44px, #543628 46px)",
    accent: "rgba(255,255,255,0.08)",
  },
  marble: {
    label: "Marble",
    background:
      "linear-gradient(135deg, #e8e4df 0%, #d4cfc8 35%, #f5f2ee 50%, #c9c4bc 100%)",
    accent: "rgba(0,0,0,0.04)",
  },
  tile: {
    label: "Ceramic Tile",
    background:
      "repeating-linear-gradient(0deg, transparent, transparent 47px, #b8b0a4 47px, #b8b0a4 48px), repeating-linear-gradient(90deg, transparent, transparent 47px, #b8b0a4 47px, #b8b0a4 48px), #d9d2c8",
    accent: "rgba(0,0,0,0.03)",
  },
  slate: {
    label: "Dark Slate",
    background:
      "repeating-linear-gradient(90deg, #2a2d32 0px, #2a2d32 40px, #1f2226 40px, #1f2226 42px)",
    accent: "rgba(255,255,255,0.06)",
  },
};

const storageKey = (restaurantId: number) => `live-tables:${restaurantId}`;

export function isTableLocked(table: LiveCanvasTable): boolean {
  return table.status === "busy" || table.status === "reserved";
}

export function isMergedCanvasTable(table: LiveCanvasTable): boolean {
  return (table.mergeSegments ?? 1) > 1 || (table.mergedParts?.length ?? 0) > 0;
}

export function isMasterLinkedTable(table: LiveCanvasTable): boolean {
  return !!table.sourceTableId && !isMergedCanvasTable(table);
}

export function suggestDuplicateTableNumber(
  label: string,
  floorId: number,
  masterTables: RestaurantTableRow[]
): string {
  const existing = new Set(
    masterTables
      .filter((table) => Number(table.floor_id) === Number(floorId))
      .map((table) => String(table.table_number).trim())
  );
  const base = `${label}-copy`;
  if (!existing.has(base)) return base;
  let index = 2;
  while (existing.has(`${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}

const ACTIVE_BOOKING_STATUSES = new Set([
  "pending",
  "confirmed",
  "completed",
  "reserved",
  "busy",
  "booked",
  "occupied",
]);

export function collectCanvasTableSourceIds(table: LiveCanvasTable): number[] {
  const ids = new Set<number>();
  if (table.sourceTableId) ids.add(table.sourceTableId);
  for (const part of table.mergedParts ?? []) {
    if (part.sourceTableId) ids.add(part.sourceTableId);
  }
  return [...ids];
}

export function findBookingsForCanvasTable(
  table: LiveCanvasTable,
  bookings: RestaurantBookingRow[]
): RestaurantBookingRow[] {
  const sourceIds = new Set(collectCanvasTableSourceIds(table));
  const mergedLabels = new Set(
    (table.mergedParts ?? []).map((part) => String(part.label))
  );

  return bookings.filter((booking) => {
    const status = (booking.booking_status ?? "").toLowerCase();
    if (!ACTIVE_BOOKING_STATUSES.has(status)) return false;
    if (booking.table_id && sourceIds.has(booking.table_id)) return true;
    if (booking.table_number == null) return false;
    const tableNo = String(booking.table_number);
    if (tableNo === String(table.label)) return true;
    if (mergedLabels.size > 0 && mergedLabels.has(tableNo)) return true;
    return false;
  });
}

/** Exact table number as saved in Table Master (no auto prefix). */
export function formatTableLabel(tableNumber: string | number): string {
  const label = String(tableNumber).trim();
  return label || "—";
}

export function tableFootprint(table: LiveCanvasTable) {
  const dim = tableDimensions(table);
  return {
    x: table.x,
    y: table.y,
    width: dim.width,
    height: dim.height,
  };
}

export function buildChairPositions(capacity: number, width: number, height: number) {
  const positions: { x: number; y: number; w: number; h: number }[] = [];
  const pad = 15;
  const chairW = 22;
  const chairH = 14;
  const chairSide = 14;
  const chairSideH = 22;

  const perSide = Math.max(1, Math.ceil(capacity / 4));
  const topCount = perSide;
  const bottomCount = perSide;
  const remaining = Math.max(0, capacity - topCount - bottomCount);
  const leftCount = Math.ceil(remaining / 2);
  const rightCount = remaining - leftCount;

  for (let i = 0; i < topCount; i++) {
    const spacing = width / (topCount + 1);
    positions.push({
      x: spacing * (i + 1) - chairW / 2,
      y: -pad,
      w: chairW,
      h: chairH,
    });
  }
  for (let i = 0; i < bottomCount && positions.length < capacity; i++) {
    const spacing = width / (bottomCount + 1);
    positions.push({
      x: spacing * (i + 1) - chairW / 2,
      y: height + pad - chairH,
      w: chairW,
      h: chairH,
    });
  }
  for (let i = 0; i < leftCount && positions.length < capacity; i++) {
    const spacing = height / (leftCount + 1);
    positions.push({
      x: -pad,
      y: spacing * (i + 1) - chairSideH / 2,
      w: chairSide,
      h: chairSideH,
    });
  }
  for (let i = 0; i < rightCount && positions.length < capacity; i++) {
    const spacing = height / (rightCount + 1);
    positions.push({
      x: width + pad - chairSide,
      y: spacing * (i + 1) - chairSideH / 2,
      w: chairSide,
      h: chairSideH,
    });
  }
  return positions.slice(0, capacity);
}

function defaultTableDimensions(table: LiveCanvasTable) {
  const segments = table.mergeSegments ?? 1;
  const unit =
    table.capacity >= 16
      ? 112
      : table.capacity >= 12
        ? 104
        : table.capacity >= 8
          ? 96
          : table.capacity >= 6
            ? 88
            : 80;

  const width = Math.round(unit + Math.max(0, table.capacity - 4) * 3);
  const height = unit;
  return { width, height, unit, segments };
}

export function tableDimensions(table: LiveCanvasTable) {
  const segments = table.mergeSegments ?? 1;
  const customW = table.sizeW ?? table.mergeSpanW;
  const customH = table.sizeH ?? table.mergeSpanH;

  if (customW && customH) {
    const unit = Math.round(Math.min(customW, customH) * 0.85);
    return {
      width: customW,
      height: customH,
      unit,
      segments,
    };
  }

  return defaultTableDimensions(table);
}

export function tableSeatCount(table: LiveCanvasTable): number {
  return table.chairSlots?.length ?? table.capacity;
}

export function initTableChairSlots(table: LiveCanvasTable): TableChairSlot[] {
  const { width, height } = tableDimensions(table);
  return buildChairPositions(table.capacity, width, height).map((p, i) => ({
    id: `tc-${table.id}-${i}`,
    relX: p.x,
    relY: p.y,
    w: p.w,
    h: p.h,
  }));
}

export function ensureTableChairSlots(table: LiveCanvasTable): LiveCanvasTable {
  if (table.chairSlots?.length) return table;
  return { ...table, chairSlots: initTableChairSlots(table) };
}

export function repositionTableChairSlots(table: LiveCanvasTable): LiveCanvasTable {
  const count = table.chairSlots?.length ?? table.capacity;
  const { width, height } = tableDimensions(table);
  const positions = buildChairPositions(count, width, height);
  return {
    ...table,
    chairSlots: positions.map((p, i) => ({
      id: table.chairSlots?.[i]?.id ?? `tc-${table.id}-${i}`,
      relX: p.x,
      relY: p.y,
      w: p.w,
      h: p.h,
    })),
  };
}

export function syncChairSlotsWithCapacity(table: LiveCanvasTable): LiveCanvasTable {
  const withSlots = ensureTableChairSlots(table);
  const existing = withSlots.chairSlots ?? [];
  if (existing.length >= table.capacity) return withSlots;

  const { width, height } = tableDimensions(table);
  const allPositions = buildChairPositions(table.capacity, width, height);
  const newSlots = [...existing];
  for (let i = existing.length; i < table.capacity; i++) {
    const p = allPositions[i];
    if (!p) break;
    newSlots.push({
      id: `tc-${table.id}-${i}`,
      relX: p.x,
      relY: p.y,
      w: p.w,
      h: p.h,
    });
  }
  return { ...withSlots, chairSlots: newSlots };
}

export function applyTableSize(
  table: LiveCanvasTable,
  width: number,
  height: number
): LiveCanvasTable {
  const w = Math.round(width);
  const h = Math.round(height);
  const resized: LiveCanvasTable = {
    ...table,
    sizeW: w,
    sizeH: h,
    mergeSpanW: (table.mergeSegments ?? 1) > 1 ? w : table.mergeSpanW,
    mergeSpanH: (table.mergeSegments ?? 1) > 1 ? h : table.mergeSpanH,
  };
  return repositionTableChairSlots(resized);
}

export function ensureFloorChairSlots(floor: LiveFloorState): LiveFloorState {
  return {
    ...floor,
    tables: floor.tables.map((t) => syncChairSlotsWithCapacity(ensureTableChairSlots(t))),
  };
}

function tableParts(table: LiveCanvasTable): MergedTablePart[] {
  if (table.mergedParts?.length) return table.mergedParts;
  return [
    {
      label: table.label,
      capacity: table.capacity,
      sourceTableId: table.sourceTableId,
    },
  ];
}

export function mergeTwoTables(
  primary: LiveCanvasTable,
  secondary: LiveCanvasTable
): LiveCanvasTable {
  const pSeg = primary.mergeSegments ?? 1;
  const sSeg = secondary.mergeSegments ?? 1;
  const parts = [...tableParts(primary), ...tableParts(secondary)];
  const totalCapacity = parts.reduce((sum, p) => sum + p.capacity, 0);

  const worstStatus = (
    a: LiveTableStatus,
    b: LiveTableStatus
  ): LiveTableStatus => {
    const rank: Record<LiveTableStatus, number> = {
      busy: 4,
      reserved: 3,
      free: 2,
      selected: 1,
    };
    return rank[a] >= rank[b] ? a : b;
  };

  const pFoot = tableFootprint(primary);
  const sFoot = tableFootprint(secondary);
  const minX = Math.min(pFoot.x, sFoot.x);
  const minY = Math.min(pFoot.y, sFoot.y);
  const maxX = Math.max(pFoot.x + pFoot.width, sFoot.x + sFoot.width);
  const maxY = Math.max(pFoot.y + pFoot.height, sFoot.y + sFoot.height);

  const bboxW = maxX - minX;
  const bboxH = maxY - minY;
  const combinedW = pFoot.width + sFoot.width + 16;
  const combinedH = Math.max(pFoot.height, sFoot.height);

  const spanW = Math.round(Math.max(bboxW, combinedW));
  const spanH = Math.round(Math.max(bboxH, combinedH));
  const merged: LiveCanvasTable = {
    id: `merged-${Date.now()}`,
    label: parts.map((p) => p.label).join("+"),
    capacity: totalCapacity,
    status: worstStatus(primary.status, secondary.status),
    x: minX,
    y: minY,
    mergeSegments: pSeg + sSeg,
    mergedLabels: parts.map((p) => p.label),
    mergedParts: parts,
    mergeSpanW: spanW,
    mergeSpanH: spanH,
    sizeW: spanW,
    sizeH: spanH,
  };
  return ensureTableChairSlots(merged);
}

export function unmergeTable(table: LiveCanvasTable): LiveCanvasTable[] {
  const parts = table.mergedParts ?? [];
  if (parts.length < 2) return [table];

  const { unit } = tableDimensions({ ...table, mergeSegments: 1, capacity: 4 });
  const gap = unit + 28;

  return parts.map((part, i) =>
    ensureTableChairSlots({
      id: part.sourceTableId ? `master-${part.sourceTableId}` : `split-${Date.now()}-${i}`,
      sourceTableId: part.sourceTableId,
      label: part.label,
      capacity: part.capacity,
      status: table.status === "selected" ? "free" : table.status,
      x: table.x + i * gap,
      y: table.y,
      mergeSegments: 1,
      mergedLabels: undefined,
      mergedParts: undefined,
      mergeSpanW: undefined,
      mergeSpanH: undefined,
      sizeW: undefined,
      sizeH: undefined,
    })
  );
}

const STATUS_PRIORITY: Record<LiveTableStatus, number> = {
  busy: 4,
  reserved: 3,
  free: 2,
  selected: 1,
};

export function pickHigherTableStatus(
  a: LiveTableStatus,
  b: LiveTableStatus
): LiveTableStatus {
  return STATUS_PRIORITY[a] >= STATUS_PRIORITY[b] ? a : b;
}

export function mapBookingStatusToLive(status?: string | null): LiveTableStatus {
  const s = (status ?? "available").toLowerCase();
  if (s === "cancelled") return "free";
  if (s === "reserved" || s === "confirmed" || s === "pending") return "reserved";
  if (s === "busy" || s === "occupied" || s === "booked" || s === "completed") {
    return "busy";
  }
  return "free";
}

export function masterTableToCanvas(
  table: RestaurantTableRow,
  index: number
): LiveCanvasTable {
  const cols = 4;
  const cellW = 180;
  const cellH = 200;
  const col = index % cols;
  const row = Math.floor(index / cols);

  return ensureTableChairSlots({
    id: `master-${table.id}`,
    sourceTableId: table.id,
    label: formatTableLabel(table.table_number),
    capacity: Math.max(2, table.chair_count || 4),
    status: mapBookingStatusToLive(table.booking_status),
    x: 56 + col * cellW,
    y: 56 + row * cellH,
    mergeSegments: 1,
  });
}

export function autoLayoutTables(
  tables: RestaurantTableRow[],
  floorId: number | null
): LiveCanvasTable[] {
  const floorTables = tables.filter((t) =>
    floorId == null ? true : Number(t.floor_id) === Number(floorId)
  );
  return floorTables.map((table, index) => masterTableToCanvas(table, index));
}

function collectUsedMasterIds(tables: LiveCanvasTable[]): Set<number> {
  const ids = new Set<number>();
  for (const table of tables) {
    if (table.mergedParts?.length) {
      for (const part of table.mergedParts) {
        if (part.sourceTableId) ids.add(part.sourceTableId);
      }
    } else if (table.sourceTableId) {
      ids.add(table.sourceTableId);
    }
  }
  return ids;
}

function isValidCanvasTable(
  table: LiveCanvasTable,
  masterIds: Set<number>
): boolean {
  if (table.mergedParts?.length) {
    const linked = table.mergedParts.filter((p) => p.sourceTableId);
    if (!linked.length) return false;
    return linked.every((p) => masterIds.has(p.sourceTableId!));
  }
  if (!table.sourceTableId) return false;
  return masterIds.has(table.sourceTableId);
}

export function refreshLayoutStatusesFromMatrix(
  layoutFloors: LiveFloorState[],
  matrixFloors: LiveFloorState[],
  apiFloors: RestaurantFloorRow[],
  allMasterTables: RestaurantTableRow[]
): LiveFloorState[] {
  const statusByTableId = new Map<string, LiveTableStatus>();
  for (const floor of matrixFloors) {
    for (const table of floor.tables) {
      statusByTableId.set(table.id, table.status);
    }
  }

  const withStatuses = layoutFloors.map((floor) => ({
    ...floor,
    tables: floor.tables.map((table) => {
      const fromMatrix = statusByTableId.get(table.id);
      if (!fromMatrix) return table;
      const base = table.status === "selected" ? "free" : table.status;
      return { ...table, status: pickHigherTableStatus(base, fromMatrix) };
    }),
  }));

  return reconcileFloorsWithMaster(withStatuses, apiFloors, allMasterTables);
}

export function reconcileFloorsWithMaster(
  savedFloors: LiveFloorState[],
  apiFloors: RestaurantFloorRow[],
  allMasterTables: RestaurantTableRow[]
): LiveFloorState[] {
  if (!apiFloors.length) {
    const fallback = savedFloors.find((f) => f.floorId == null) ?? savedFloors[0];
    if (fallback) {
      return [
        ensureFloorChairSlots(
          reconcileFloorWithMaster(
            { ...fallback, id: fallback.id || "floor-1", floorId: null },
            allMasterTables
          )
        ),
      ];
    }
    return buildInitialFloors([], allMasterTables).map(ensureFloorChairSlots);
  }

  const savedByFloorId = new Map(
    savedFloors
      .filter((f) => f.floorId != null)
      .map((f) => [Number(f.floorId), f])
  );

  return apiFloors
    .slice()
    .sort((a, b) => a.floor_no - b.floor_no)
    .map((apiFloor) => {
      const saved = savedByFloorId.get(apiFloor.id);
      const base: LiveFloorState = saved
        ? {
            ...saved,
            floorId: apiFloor.id,
            label: `Floor ${apiFloor.floor_no}`,
            floorNo: apiFloor.floor_no,
          }
        : {
            id: `floor-${apiFloor.id}`,
            floorId: apiFloor.id,
            label: `Floor ${apiFloor.floor_no}`,
            floorNo: apiFloor.floor_no,
            floorDesign: "wood",
            tables: autoLayoutTables(allMasterTables, apiFloor.id),
            chairs: [],
          };
      return ensureFloorChairSlots(
        reconcileFloorWithMaster(base, allMasterTables)
      );
    });
}

export function buildMatrixPayload(
  floors: LiveFloorState[],
  activeFloorId: string
): LiveTablesPersisted {
  return {
    version: LIVE_TABLE_MATRIX_VERSION,
    floors,
    activeFloorId,
  };
}

export function reconcileFloorWithMaster(
  floor: LiveFloorState,
  allMasterTables: RestaurantTableRow[]
): LiveFloorState {
  const floorMaster = allMasterTables.filter((t) =>
    floor.floorId == null ? true : Number(t.floor_id) === Number(floor.floorId)
  );
  const masterById = new Map(floorMaster.map((t) => [t.id, t]));

  const masterIds = new Set(floorMaster.map((t) => t.id));

  const updatedTables = floor.tables
    .filter((canvas) => isValidCanvasTable(canvas, masterIds))
    .map((canvas) => {
    if (canvas.mergedParts?.length) {
      const refreshedParts = canvas.mergedParts.map((part) => {
        if (!part.sourceTableId) return part;
        const master = masterById.get(part.sourceTableId);
        if (!master) return part;
        return {
          ...part,
          label: formatTableLabel(master.table_number),
          capacity: Math.max(2, master.chair_count || 4),
        };
      });
      const totalCapacity = refreshedParts.reduce((s, p) => s + p.capacity, 0);
      const canvasStatus = canvas.status === "selected" ? "free" : canvas.status;
      const statuses = refreshedParts.map((p) => {
        const masterStatus = p.sourceTableId
          ? mapBookingStatusToLive(masterById.get(p.sourceTableId)?.booking_status)
          : "free";
        return pickHigherTableStatus(canvasStatus, masterStatus);
      });
      const status: LiveTableStatus = statuses.includes("busy")
        ? "busy"
        : statuses.includes("reserved")
          ? "reserved"
          : canvasStatus;

      return syncChairSlotsWithCapacity({
        ...canvas,
        mergedParts: refreshedParts,
        mergedLabels: refreshedParts.map((p) => p.label),
        label: refreshedParts.map((p) => p.label).join("+"),
        capacity: totalCapacity,
        status,
      });
    }

    const master = masterById.get(canvas.sourceTableId!);
    if (!master) return canvas;
    const canvasStatus = canvas.status === "selected" ? "free" : canvas.status;
    return syncChairSlotsWithCapacity({
      ...canvas,
      label: formatTableLabel(master.table_number),
      capacity: Math.max(2, master.chair_count || 4),
      status: pickHigherTableStatus(
        canvasStatus,
        mapBookingStatusToLive(master.booking_status)
      ),
    });
  });

  const usedIds = collectUsedMasterIds(updatedTables);
  const missing = floorMaster.filter((m) => !usedIds.has(m.id));
  const startIndex = updatedTables.length;
  const newTables = missing.map((m, i) =>
    masterTableToCanvas(m, startIndex + i)
  );

  return ensureFloorChairSlots({
    ...floor,
    floorDesign: floor.floorDesign ?? "wood",
    tables: [...updatedTables, ...newTables],
  });
}

export function buildInitialFloors(
  apiFloors: RestaurantFloorRow[],
  apiTables: RestaurantTableRow[]
): LiveFloorState[] {
  if (apiFloors.length === 0) {
    return [
      {
        id: "floor-1",
        floorId: null,
        label: "Floor 1",
        floorNo: 1,
        floorDesign: "wood",
        tables: autoLayoutTables(apiTables, null),
        chairs: [],
      },
    ];
  }

  return apiFloors
    .slice()
    .sort((a, b) => a.floor_no - b.floor_no)
    .map((floor) => ({
      id: `floor-${floor.id}`,
      floorId: floor.id,
      label: `Floor ${floor.floor_no}`,
      floorNo: floor.floor_no,
      floorDesign: "wood" as FloorDesignId,
      tables: autoLayoutTables(apiTables, floor.id),
      chairs: [],
    }));
}

export function loadLiveTablesState(restaurantId: number): LiveTablesPersisted | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(restaurantId));
    if (!raw) return null;
    return JSON.parse(raw) as LiveTablesPersisted;
  } catch {
    return null;
  }
}

export function saveLiveTablesState(
  restaurantId: number,
  state: LiveTablesPersisted
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(restaurantId), JSON.stringify(state));
}

export function nextFloorNo(floors: LiveFloorState[]): number {
  if (!floors.length) return 1;
  return Math.max(...floors.map((f) => f.floorNo)) + 1;
}

export function createLocalFloor(floors: LiveFloorState[]): LiveFloorState {
  const floorNo = nextFloorNo(floors);
  return {
    id: `local-${Date.now()}`,
    floorId: null,
    label: `Floor ${floorNo}`,
    floorNo,
    floorDesign: "wood",
    tables: [],
    chairs: [],
  };
}
