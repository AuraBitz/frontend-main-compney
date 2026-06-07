"use client";

import type { ColDef, ICellRendererParams } from "ag-grid-community";
import type { LucideIcon } from "lucide-react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TableRowAction<T> {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "ghost" | "destructive";
  onClick: (row: T) => void;
  hidden?: (row: T) => boolean;
}

interface ActionsCellParams<T> extends ICellRendererParams<T> {
  actions: TableRowAction<T>[];
}

export function TableRowActionsCell<T extends object>(
  params: ActionsCellParams<T>
) {
  const row = params.data;
  if (!row) return null;

  const visible = (params.actions ?? []).filter(
    (action) => !action.hidden?.(row)
  );

  if (!visible.length) return null;

  return (
    <div
      className="flex h-full min-h-10 w-full flex-wrap items-center justify-center gap-1 px-1 py-1.5"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {visible.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            type="button"
            size="xs"
            variant={action.variant ?? "outline"}
            className="h-7 shrink-0 gap-1 px-2.5"
            title={action.label}
            aria-label={action.label}
            onClick={() => action.onClick(row)}
          >
            {Icon && <Icon className="size-3.5 shrink-0" />}
            <span className="whitespace-nowrap text-[11px]">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

interface SelectCellParams<T> extends ICellRendererParams<T> {
  onSelect: (row: T) => void;
  isSelected?: (row: T) => boolean;
}

function SelectActionCell<T extends object>(params: SelectCellParams<T>) {
  const row = params.data;
  if (!row) return null;

  const selected = params.isSelected?.(row) ?? false;

  return (
    <div
      className="flex h-full items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        type="button"
        size="xs"
        variant={selected ? "default" : "outline"}
        className="h-7 min-w-[4.5rem] px-2"
        onClick={() => params.onSelect(row)}
      >
        {selected ? "Selected" : "Select"}
      </Button>
    </div>
  );
}

/** Pinned left — first column for picker sidebars */
export function buildSelectColumnDef<T extends object>(
  onSelect: (row: T) => void,
  options?: {
    isSelected?: (row: T) => boolean;
    headerName?: string;
  }
): ColDef<T> {
  const minWidth = 100;

  return {
    headerName: options?.headerName ?? "Select",
    colId: "select_action",
    pinned: "left",
    lockPinned: true,
    lockVisible: true,
    sortable: false,
    filter: false,
    floatingFilter: false,
    resizable: false,
    suppressMovable: true,
    suppressSizeToFit: true,
    suppressAutoSize: true,
    flex: 0,
    minWidth,
    maxWidth: minWidth,
    width: minWidth,
    cellClass: cn("ag-cell-select-action", "!flex items-center justify-center"),
    cellRenderer: SelectActionCell,
    cellRendererParams: {
      onSelect,
      isSelected: options?.isSelected,
    },
  };
}

export function buildActionsColumnDef<T extends object>(
  actions: TableRowAction<T>[],
  options?: { headerName?: string; minWidth?: number }
): ColDef<T> {
  const count = Math.max(actions.length, 1);
  const minWidth = options?.minWidth ?? Math.min(72 + count * 78, 320);

  return {
    headerName: options?.headerName ?? "Actions",
    colId: "actions",
    pinned: "right",
    lockPinned: true,
    lockVisible: true,
    sortable: false,
    filter: false,
    floatingFilter: false,
    resizable: true,
    suppressMovable: true,
    suppressSizeToFit: true,
    suppressAutoSize: true,
    flex: 0,
    minWidth,
    width: minWidth,
    cellClass: cn("ag-cell-actions", "!overflow-visible"),
    cellRenderer: TableRowActionsCell,
    cellRendererParams: { actions },
  };
}

/** Common action presets */
export function viewRowAction<T extends { id?: number | string }>(
  onClick: (row: T) => void
): TableRowAction<T> {
  return {
    id: "view",
    label: "View",
    icon: Eye,
    variant: "outline",
    onClick,
  };
}

export function editRowAction<T extends { id?: number | string }>(
  onClick: (row: T) => void
): TableRowAction<T> {
  return {
    id: "edit",
    label: "Edit",
    icon: Pencil,
    variant: "outline",
    onClick,
  };
}

export function deleteRowAction<T extends { id?: number | string }>(
  onClick: (row: T) => void
): TableRowAction<T> {
  return {
    id: "delete",
    label: "Delete",
    icon: Trash2,
    variant: "destructive",
    onClick,
  };
}
