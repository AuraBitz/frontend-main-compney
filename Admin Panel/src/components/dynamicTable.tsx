"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  FilterChangedEvent,
  GridApi,
  GridReadyEvent,
  RowClassParams,
} from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { createAdminGridTheme } from "@/components/grid/grid-theme";
import { GridToolbar } from "@/components/grid/GridToolbar";
import {
  buildActionsColumnDef,
  type TableRowAction,
} from "@/components/grid/TableRowActions";
import {
  agFilterModelToListFilters,
  type ListQueryPayload,
} from "@/lib/filter-builder-v2";
import type { ListResult } from "@/lib/list-response";
import { defaultListQuery } from "@/lib/list-query";
import { withDateColumnFilters } from "@/lib/table-column-utils";
import { cn } from "@/lib/utils";

export type { TableRowAction };
export {
  buildActionsColumnDef,
  viewRowAction,
  editRowAction,
  deleteRowAction,
  buildSelectColumnDef,
} from "@/components/grid/TableRowActions";

ModuleRegistry.registerModules([AllCommunityModule]);

export interface DynamicTableProps<T extends object> {
  rowData: T[];
  columnDefs: ColDef<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  className?: string;
  height?: string;
  toolbar?: React.ReactNode;
  caption?: string;
  emptyMessage?: string;
  pageSize?: number;
  onGridReady?: (api: GridApi<T>) => void;
  /** Global search, column picker, top pagination, header filters */
  showTableToolbar?: boolean;
  /** View / Edit / custom buttons — pinned actions column on the right */
  rowActions?: TableRowAction<T>[];
  /** Backend list `meta.total` */
  totalRowCount?: number;
  /** Fields using calendar filter + Filter Builder V2 date ops on server */
  dateFields?: string[];
  /** Refetch rows when column filters change (uses backend filter-builder-v2) */
  onServerFilter?: (query: ListQueryPayload) => Promise<ListResult<T>>;
}

export function DynamicTable<T extends object>({
  rowData,
  columnDefs,
  loading = false,
  onRowClick,
  className,
  height = "520px",
  toolbar,
  caption,
  emptyMessage = "No records found",
  pageSize = 10,
  onGridReady,
  showTableToolbar = true,
  rowActions,
  totalRowCount,
  dateFields = [],
  onServerFilter,
}: DynamicTableProps<T>) {
  const gridRef = useRef<AgGridReact<T>>(null);
  const { theme, mounted: themeMounted } = useTheme();
  const [gridApi, setGridApi] = useState<GridApi<T> | null>(null);
  const [quickFilter, setQuickFilter] = useState("");
  const [serverRows, setServerRows] = useState<T[]>([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [serverLoading, setServerLoading] = useState(false);
  const filterDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serverMode = Boolean(onServerFilter);

  const gridTheme = useMemo(
    () => (themeMounted ? createAdminGridTheme(theme) : createAdminGridTheme("light")),
    [theme, themeMounted]
  );

  const mergedColumnDefs = useMemo(() => {
    const cols = withDateColumnFilters(columnDefs, dateFields);
    if (rowActions?.length) {
      cols.push(buildActionsColumnDef(rowActions));
    }
    return cols;
  }, [columnDefs, rowActions, dateFields]);

  const displayRows = serverMode ? serverRows : rowData;
  const displayLoading = serverMode ? serverLoading : loading;
  const displayTotal = serverMode ? serverTotal : totalRowCount;
  const isEmpty = !displayLoading && displayRows.length === 0;
  const hasData = displayRows.length > 0;
  const showBodyLoading = displayLoading;

  const runServerFetch = useCallback(
    async (api: GridApi<T>) => {
      if (!onServerFilter) return;
      const filters = agFilterModelToListFilters(
        api.getFilterModel() as Record<string, unknown>,
        dateFields
      );
      setServerLoading(true);
      try {
        const result = await onServerFilter({
          ...defaultListQuery,
          filters,
        });
        setServerRows(result.rows);
        setServerTotal(result.total);
      } catch {
        setServerRows([]);
        setServerTotal(0);
      } finally {
        setServerLoading(false);
      }
    },
    [onServerFilter, dateFields]
  );

  const handleFilterChanged = useCallback(
    (event: FilterChangedEvent<T>) => {
      if (!serverMode) return;
      if (filterDebounceRef.current) {
        clearTimeout(filterDebounceRef.current);
      }
      filterDebounceRef.current = setTimeout(() => {
        void runServerFetch(event.api);
      }, 400);
    },
    [serverMode, runServerFetch]
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
      },
      resizable: true,
      flex: 1,
      minWidth: 120,
      suppressSizeToFit: true,
    }),
    []
  );

  const handleGridReady = useCallback(
    (params: GridReadyEvent<T>) => {
      setGridApi(params.api);
      if (rowActions?.length && params.api.getColumn("actions")) {
        const width =
          params.api.getColumn("actions")?.getActualWidth() ?? 160;
        params.api.setColumnWidths([{ key: "actions", newWidth: width }]);
      }
      if (serverMode) {
        void runServerFetch(params.api);
      }
      onGridReady?.(params.api);
    },
    [onGridReady, rowActions?.length, serverMode, runServerFetch]
  );

  useEffect(() => {
    return () => {
      if (filterDebounceRef.current) clearTimeout(filterDebounceRef.current);
    };
  }, []);

  const getRowClass = useCallback(
    (params: RowClassParams) => {
      const classes: string[] = [];
      if (onRowClick) classes.push("ag-row-clickable");
      if (params.node.rowIndex !== null && params.node.rowIndex % 2 === 1) {
        classes.push("ag-row-odd-custom");
      }
      return classes;
    },
    [onRowClick]
  );

  const loadingOverlayHtml = `
    <div class="admin-grid-overlay admin-grid-overlay--loading">
      <div class="admin-grid-overlay__spinner" aria-hidden="true"></div>
      <p class="admin-grid-overlay__title">Loading records</p>
      <p class="admin-grid-overlay__hint">Please wait…</p>
    </div>
  `;

  const emptyOverlayHtml = `
    <div class="admin-grid-overlay admin-grid-overlay--empty">
      <div class="admin-grid-overlay__icon" aria-hidden="true">◇</div>
      <p class="admin-grid-overlay__title">${emptyMessage}</p>
      <p class="admin-grid-overlay__hint">Try adjusting filters or add a new record</p>
    </div>
  `;

  return (
    <div
      className={cn(
        "admin-data-grid overflow-hidden rounded-xl border border-border/80 bg-card shadow-md ring-1 ring-border/40",
        displayLoading && "admin-data-grid--loading",
        isEmpty && "admin-data-grid--empty",
        hasData && "admin-data-grid--populated",
        className
      )}
    >
      {showTableToolbar && (
        <GridToolbar<T>
          columnDefs={mergedColumnDefs}
          gridApi={gridApi}
          quickFilter={quickFilter}
          onQuickFilterChange={setQuickFilter}
          toolbar={toolbar}
          totalRowCount={displayTotal}
          loading={displayLoading}
        />
      )}

      {!showTableToolbar && (toolbar || caption) && (
        <div className="flex flex-col gap-3 border-b border-border bg-secondary/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          {toolbar && (
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {toolbar}
            </div>
          )}
          {caption && (
            <p className="shrink-0 text-sm text-muted-foreground">
              {loading ? "Loading..." : caption}
            </p>
          )}
        </div>
      )}

      <div
        style={{ height }}
        className="relative flex w-full min-h-0 flex-col admin-data-grid__viewport"
      >
        {showBodyLoading && (
          <div
            className="admin-data-grid__body-loader"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2 className="size-7 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">
              Loading data…
            </p>
          </div>
        )}
        <AgGridReact<T>
          ref={gridRef}
          theme={gridTheme}
          className="min-h-0 flex-1"
          rowData={displayRows}
          columnDefs={mergedColumnDefs}
          defaultColDef={defaultColDef}
          quickFilterText={serverMode ? undefined : quickFilter}
          rowHeight={52}
          headerHeight={52}
          floatingFiltersHeight={40}
          pagination
          paginationPageSize={pageSize}
          suppressPaginationPanel
          suppressCellFocus
          animateRows={false}
          alwaysShowHorizontalScroll
          enableCellTextSelection
          getRowClass={getRowClass}
          onGridReady={handleGridReady}
          onFilterChanged={handleFilterChanged}
          onRowClicked={
            onRowClick
              ? (event) => {
                  if (event.data) onRowClick(event.data);
                }
              : undefined
          }
          overlayLoadingTemplate={loadingOverlayHtml}
          overlayNoRowsTemplate={emptyOverlayHtml}
        />
      </div>
    </div>
  );
}

/** @deprecated Use rowActions prop or buildActionsColumnDef() */
export function tableActionColumn<T extends object>(
  actions: TableRowAction<T>[]
): ColDef<T> {
  return buildActionsColumnDef(actions) as ColDef<T>;
}
