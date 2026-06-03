"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  GridApi,
  GridReadyEvent,
  RowClassParams,
} from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { createAdminGridTheme } from "@/components/grid/grid-theme";
import { GridToolbar } from "@/components/grid/GridToolbar";
import { cn } from "@/lib/utils";

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
}: DynamicTableProps<T>) {
  const gridRef = useRef<AgGridReact<T>>(null);
  const { theme, mounted: themeMounted } = useTheme();
  const [gridApi, setGridApi] = useState<GridApi<T> | null>(null);
  const [quickFilter, setQuickFilter] = useState("");

  const gridTheme = useMemo(
    () => (themeMounted ? createAdminGridTheme(theme) : createAdminGridTheme("light")),
    [theme, themeMounted]
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
      cellClass: "ag-cell-flex",
    }),
    []
  );

  const handleGridReady = useCallback(
    (params: GridReadyEvent<T>) => {
      setGridApi(params.api);
      params.api.sizeColumnsToFit();
      onGridReady?.(params.api);
    },
    [onGridReady]
  );

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

  return (
    <div
      className={cn(
        "admin-data-grid overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className
      )}
    >
      {showTableToolbar && (
        <GridToolbar<T>
          columnDefs={columnDefs}
          gridApi={gridApi}
          quickFilter={quickFilter}
          onQuickFilterChange={setQuickFilter}
          toolbar={toolbar}
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

      <div style={{ height }} className="w-full">
        {loading && rowData.length === 0 ? (
          <div
            className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground"
            style={{ height }}
          >
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm">Loading data...</span>
          </div>
        ) : (
          <AgGridReact<T>
            ref={gridRef}
            theme={gridTheme}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            quickFilterText={quickFilter}
            rowHeight={52}
            headerHeight={52}
            floatingFiltersHeight={40}
            pagination
            paginationPageSize={pageSize}
            suppressPaginationPanel
            suppressCellFocus
            animateRows
            enableCellTextSelection
            getRowClass={getRowClass}
            onGridReady={handleGridReady}
            onRowClicked={
              onRowClick
                ? (event) => {
                    if (event.data) onRowClick(event.data);
                  }
                : undefined
            }
            overlayLoadingTemplate='<span class="ag-overlay-loading-center">Loading...</span>'
            overlayNoRowsTemplate={`<span class="ag-overlay-no-rows-center">${emptyMessage}</span>`}
          />
        )}
      </div>
    </div>
  );
}

/** Right-pinned actions column */
export function tableActionColumn<T>(): ColDef<T> {
  return {
    headerName: "",
    colId: "actions",
    maxWidth: 72,
    minWidth: 72,
    width: 72,
    sortable: false,
    filter: false,
    floatingFilter: false,
    resizable: false,
    pinned: "right",
    cellClass: "ag-cell-actions",
  };
}
