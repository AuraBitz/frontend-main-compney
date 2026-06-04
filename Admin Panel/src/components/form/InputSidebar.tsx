"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { Check, PanelRightOpen, X } from "lucide-react";
import type { ListApiObject } from "@/types/list-api.types";
import { DynamicTable, buildSelectColumnDef } from "@/components/dynamicTable";
import { defaultListQuery } from "@/lib/list-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import type { InputSidebarColumnDef } from "@/types/dynamic-form.types";

export type { InputSidebarColumnDef };

export interface InputSidebarProps {
  id?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  apiObject: ListApiObject;
  selectedData: string;
  rowValueKey?: string;
  displayedData: string;
  sheetTitle?: string;
  displayFields?: string[];
  customColumnDefs?: InputSidebarColumnDef[];
  multiSelect?: boolean;
  isWholeObject?: boolean;
  value: unknown;
  displayText?: string;
  onChange: (patch: Record<string, unknown>) => void;
  cacheFieldName?: string;
}

function rowLabel(
  row: Record<string, unknown>,
  displayedData: string
): string {
  const v = row[displayedData];
  return v != null ? String(v) : "";
}

function normalizeIds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }
  if (value != null && value !== "") {
    return [String(value)];
  }
  return [];
}

export function InputSidebar({
  id,
  label,
  placeholder = "Click to select",
  disabled = false,
  error,
  apiObject,
  selectedData,
  rowValueKey = "id",
  displayedData,
  sheetTitle,
  displayFields = [],
  customColumnDefs = [],
  multiSelect = false,
  isWholeObject = false,
  value,
  displayText = "",
  onChange,
  cacheFieldName,
}: InputSidebarProps) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  const selectedIds = normalizeIds(value);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiObject.list(defaultListQuery);
      setRows(result.rows as Record<string, unknown>[]);
      setTotal(result.total);
    } catch {
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [apiObject]);

  useEffect(() => {
    if (open) void loadRows();
  }, [open, loadRows]);

  useEffect(() => {
    if (!open || !multiSelect) return;
    const ids = normalizeIds(value);
    setPendingIds(ids);
  }, [open, multiSelect, value]);

  const applyMultiSelect = useCallback(() => {
    const label = pendingIds
      .map((id) => {
        const row = rows.find((r) => String(r[rowValueKey]) === id);
        return row ? rowLabel(row, displayedData) : "";
      })
      .filter(Boolean)
      .join(", ");
    const patch: Record<string, unknown> = {
      [selectedData]: pendingIds,
    };
    if (cacheFieldName) {
      patch[cacheFieldName] = label;
    }
    onChange(patch);
    setOpen(false);
  }, [
    pendingIds,
    rows,
    rowValueKey,
    displayedData,
    selectedData,
    cacheFieldName,
    onChange,
  ]);

  const handleSelect = useCallback(
    (row: Record<string, unknown>) => {
      const idVal = String(row[rowValueKey]);
      const name = rowLabel(row, displayedData);

      if (multiSelect) {
        setPendingIds((prev) => {
          const has = prev.includes(idVal);
          return has ? prev.filter((x) => x !== idVal) : [...prev, idVal];
        });
        return;
      }

      const patch: Record<string, unknown> = {
        [selectedData]: row[rowValueKey],
      };
      if (cacheFieldName) {
        patch[cacheFieldName] = isWholeObject ? row : name;
      }
      onChange(patch);
      setOpen(false);
    },
    [
      rowValueKey,
      selectedData,
      displayedData,
      cacheFieldName,
      isWholeObject,
      multiSelect,
      onChange,
    ]
  );

  const isRowSelected = useCallback(
    (row: Record<string, unknown>) => {
      const idVal = String(row[rowValueKey]);
      if (multiSelect) {
        const check = open ? pendingIds : selectedIds;
        return check.includes(idVal);
      }
      if (value == null || value === "") return false;
      return idVal === String(value);
    },
    [value, rowValueKey, multiSelect, open, pendingIds, selectedIds]
  );

  const columnDefs = useMemo<ColDef<Record<string, unknown>>[]>(() => {
    const selectCol = buildSelectColumnDef<Record<string, unknown>>(
      handleSelect,
      {
        isSelected: isRowSelected,
        headerName: multiSelect ? "Add / Remove" : "Select",
      }
    );

    const dataCols: ColDef<Record<string, unknown>>[] = customColumnDefs.length
      ? customColumnDefs.map((col) => ({
          field: col.key,
          headerName: col.label,
          minWidth: 140,
          flex: 1,
        }))
      : (displayFields.length > 0 ? displayFields : [displayedData]).map(
          (field) => ({
            field,
            headerName: field.replace(/_/g, " "),
            minWidth: 140,
            flex: 1,
          })
        );

    return [selectCol, ...dataCols];
  }, [
    customColumnDefs,
    displayFields,
    displayedData,
    handleSelect,
    isRowSelected,
    multiSelect,
  ]);

  const triggerText = displayText?.trim() ?? "";
  const hasSelection = multiSelect
    ? selectedIds.length > 0
    : value != null && value !== "";

  const handleClear = () => {
    const patch: Record<string, unknown> = {
      [selectedData]: multiSelect ? [] : "",
    };
    if (cacheFieldName) patch[cacheFieldName] = "";
    onChange(patch);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Input
            id={id}
            readOnly
            disabled={disabled}
            value={triggerText}
            placeholder={placeholder}
            onClick={() => !disabled && setOpen(true)}
            className={cn(
              "h-10 w-full cursor-pointer border-input/80 bg-background pr-9 shadow-sm",
              error && "border-destructive"
            )}
          />
          {hasSelection && (
            <Check className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-primary" />
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled}
          onClick={() => setOpen(true)}
          aria-label="Open selector"
          className="shrink-0"
        >
          <PanelRightOpen className="size-4" />
        </Button>
        {hasSelection && !disabled && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={handleClear}
            aria-label="Clear"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton
          className={cn(
            "flex h-full max-h-[100dvh] w-[min(92vw,56rem)] max-w-[min(92vw,56rem)] flex-col gap-0 overflow-hidden p-0",
            "data-[side=right]:h-full data-[side=right]:w-[min(92vw,56rem)]",
            "data-[side=right]:max-w-[min(92vw,56rem)] data-[side=right]:sm:max-w-[min(92vw,56rem)]"
          )}
        >
          <SheetHeader className="shrink-0 border-b border-border bg-muted/20 px-6 py-4">
            <SheetTitle className="text-lg">
              {sheetTitle ?? label ?? "Select record"}
            </SheetTitle>
            <p className="text-sm text-muted-foreground">
              {multiSelect ? (
                <>
                  Toggle rows with <strong>Select</strong>, then confirm with{" "}
                  <strong>Done</strong> below.
                  {pendingIds.length > 0 && (
                    <span className="mt-1 block font-medium text-foreground">
                      {pendingIds.length} selected
                    </span>
                  )}
                </>
              ) : (
                <>
                  Click <strong>Select</strong> on a row — name shows in the
                  field, ID is saved for the server.
                </>
              )}
            </p>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 pb-2">
            <div className="min-h-[240px] flex-1">
              <DynamicTable<Record<string, unknown>>
                rowData={rows}
                columnDefs={columnDefs}
                loading={loading}
                totalRowCount={total}
                height="100%"
                showTableToolbar
                className="h-full min-h-0"
              />
            </div>
          </div>

          {multiSelect && (
            <div className="z-20 flex shrink-0 items-center justify-between gap-3 border-t border-border bg-card px-6 py-4 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.12)]">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {pendingIds.length}
                </span>{" "}
                module{pendingIds.length === 1 ? "" : "s"} selected
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={applyMultiSelect}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
