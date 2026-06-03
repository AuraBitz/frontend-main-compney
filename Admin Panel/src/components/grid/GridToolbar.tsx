"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColDef, GridApi } from "ag-grid-community";
import { Columns3, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface GridColumnOption {
  colId: string;
  headerName: string;
  visible: boolean;
}

function getColId<T>(col: ColDef<T>): string | null {
  const id = col.colId ?? col.field;
  if (!id || typeof id !== "string") return null;
  if (col.filter === false && col.floatingFilter === false) return null;
  return id;
}

function buildColumnOptions<T>(columnDefs: ColDef<T>[]): GridColumnOption[] {
  return columnDefs
    .map((col) => {
      const colId = getColId(col);
      if (!colId) return null;
      return {
        colId,
        headerName: col.headerName ?? colId,
        visible: col.hide !== true,
      };
    })
    .filter((c): c is GridColumnOption => c !== null);
}

function cloneColumns(cols: GridColumnOption[]): GridColumnOption[] {
  return cols.map((c) => ({ ...c }));
}

interface GridToolbarProps<T extends object> {
  columnDefs: ColDef<T>[];
  gridApi: GridApi<T> | null;
  quickFilter: string;
  onQuickFilterChange: (value: string) => void;
  toolbar?: React.ReactNode;
}

export function GridToolbar<T extends object>({
  columnDefs,
  gridApi,
  quickFilter,
  onQuickFilterChange,
  toolbar,
}: GridToolbarProps<T>) {
  const [columns, setColumns] = useState<GridColumnOption[]>(() =>
    buildColumnOptions(columnDefs)
  );
  const [draftColumns, setDraftColumns] = useState<GridColumnOption[]>([]);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setColumns(buildColumnOptions(columnDefs));
  }, [columnDefs]);

  const openColumnsDialog = useCallback(() => {
    setDraftColumns(cloneColumns(columns));
    setColumnsOpen(true);
  }, [columns]);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setDraftColumns(cloneColumns(columns));
      }
      setColumnsOpen(open);
    },
    [columns]
  );

  const applyDraftToGrid = useCallback(() => {
    if (!gridApi) return;
    draftColumns.forEach((col) => {
      gridApi.setColumnsVisible([col.colId], col.visible);
    });
    setColumns(cloneColumns(draftColumns));
    setColumnsOpen(false);
  }, [gridApi, draftColumns]);

  const resetDraftColumns = useCallback(() => {
    setDraftColumns((prev) => prev.map((c) => ({ ...c, visible: true })));
  }, []);

  const toggleDraftColumn = useCallback((colId: string, visible: boolean) => {
    setDraftColumns((prev) =>
      prev.map((c) => (c.colId === colId ? { ...c, visible } : c))
    );
  }, []);

  const syncPagination = useCallback(() => {
    if (!gridApi) return;
    setCurrentPage(gridApi.paginationGetCurrentPage());
    setTotalPages(gridApi.paginationGetTotalPages());
  }, [gridApi]);

  useEffect(() => {
    if (!gridApi) return;
    syncPagination();
    gridApi.addEventListener("paginationChanged", syncPagination);
    gridApi.addEventListener("modelUpdated", syncPagination);
    return () => {
      gridApi.removeEventListener("paginationChanged", syncPagination);
      gridApi.removeEventListener("modelUpdated", syncPagination);
    };
  }, [gridApi, syncPagination]);

  const displayPage = totalPages === 0 ? 0 : currentPage + 1;
  const canGoPrev = currentPage > 0;
  const canGoNext = totalPages > 0 && currentPage < totalPages - 1;

  const pageButtons = useMemo(
    () => (
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="h-10 min-w-10 px-1 font-mono text-sm"
          disabled={!gridApi || !canGoPrev}
          onClick={() => gridApi?.paginationGoToFirstPage()}
          aria-label="First page"
        >
          &laquo;&laquo;
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="h-10 min-w-10 px-1 font-mono text-sm"
          disabled={!gridApi || !canGoPrev}
          onClick={() => gridApi?.paginationGoToPreviousPage()}
          aria-label="Previous page"
        >
          &laquo;
        </Button>
        <span
          className="flex h-10 min-w-11 items-center justify-center rounded-md border border-border bg-background px-2.5 font-mono text-base font-medium tabular-nums"
          aria-live="polite"
        >
          {displayPage}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="h-10 min-w-10 px-1 font-mono text-sm"
          disabled={!gridApi || !canGoNext}
          onClick={() => gridApi?.paginationGoToNextPage()}
          aria-label="Next page"
        >
          &raquo;
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="h-10 min-w-10 px-1 font-mono text-sm"
          disabled={!gridApi || !canGoNext}
          onClick={() => gridApi?.paginationGoToLastPage()}
          aria-label="Last page"
        >
          &raquo;&raquo;
        </Button>
      </div>
    ),
    [gridApi, canGoPrev, canGoNext, displayPage]
  );

  return (
    <div className="admin-grid-toolbar flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        {toolbar}
        <div className="relative min-w-50 flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Global search..."
            value={quickFilter}
            onChange={(e) => onQuickFilterChange(e.target.value)}
            className="h-10 pl-10 text-base"
            aria-label="Global search"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="default"
          className="h-10 gap-2 px-4 text-base"
          onClick={openColumnsDialog}
        >
          <Columns3 className="size-5" />
          Columns
        </Button>

        <Dialog open={columnsOpen} onOpenChange={handleDialogOpenChange}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Show columns</DialogTitle>
            </DialogHeader>
            <div className="grid max-h-[min(60vh,360px)] grid-cols-2 gap-x-3 gap-y-1 overflow-y-auto pr-1">
              {draftColumns.map((col) => (
                <label
                  key={col.colId}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 transition-colors",
                    "hover:bg-muted/80"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={col.visible}
                    onChange={(e) =>
                      toggleDraftColumn(col.colId, e.target.checked)
                    }
                    className="size-4 shrink-0 rounded border border-input accent-primary"
                  />
                  <span className="truncate text-sm font-medium">
                    {col.headerName}
                  </span>
                </label>
              ))}
            </div>
            <DialogFooter showCloseButton={false} className="gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={resetDraftColumns}
              >
                Reset
              </Button>
              <Button type="button" onClick={applyDraftToGrid}>
                Apply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex shrink-0 items-center justify-end sm:ml-auto">
        {pageButtons}
      </div>
    </div>
  );
}
