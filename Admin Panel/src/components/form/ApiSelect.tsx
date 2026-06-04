"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2, Search, X } from "lucide-react";
import type { ListApiObject, SelectedDataKey } from "@/types/list-api.types";
import { defaultListQuery } from "@/lib/list-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ApiSelectProps {
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  apiObject: ListApiObject;
  selectedDataKey: SelectedDataKey;
  isWholeObject?: boolean;
  displayedData?: string;
  /** Pre-resolved label (from cache) — avoids showing raw id before options load */
  displayText?: string;
  showIdInList?: boolean;
  value: unknown;
  onChange: (value: unknown) => void;
  onRowSelect?: (row: Record<string, unknown>) => void;
}

function readLabel(
  row: Record<string, unknown>,
  keys: SelectedDataKey
): string {
  const label = row[keys.label];
  return label != null ? String(label).trim() : "";
}

function readVal(row: Record<string, unknown>, keys: SelectedDataKey): string {
  const val = row[keys.val];
  return val != null ? String(val) : "";
}

export function ApiSelect({
  id,
  placeholder = "Select...",
  disabled = false,
  apiObject,
  selectedDataKey,
  isWholeObject = false,
  displayedData,
  displayText,
  showIdInList = false,
  value,
  onChange,
  onRowSelect,
}: ApiSelectProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<Record<string, unknown>[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadOptions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiObject.list(defaultListQuery);
      setOptions(result.rows as Record<string, unknown>[]);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [apiObject]);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    if (open && options.length === 0) {
      void loadOptions();
    }
  }, [open, options.length, loadOptions]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selectedLabel = useMemo(() => {
    if (displayText?.trim()) return displayText.trim();
    if (value == null || value === "") return "";
    const valStr = String(value);
    const match = options.find(
      (row) => readVal(row, selectedDataKey) === valStr
    );
    if (match) {
      const key = displayedData || selectedDataKey.label;
      const text = match[key] ?? readLabel(match, selectedDataKey);
      return text ? String(text) : "";
    }
    return "";
  }, [value, options, selectedDataKey, displayedData, displayText]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((row) => {
      const text = readLabel(row, selectedDataKey).toLowerCase();
      return text.includes(q);
    });
  }, [options, search, selectedDataKey]);

  const handleSelect = (row: Record<string, unknown>) => {
    const val = readVal(row, selectedDataKey);
    onChange(val);
    if (isWholeObject) onRowSelect?.(row);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    onRowSelect?.({});
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input/80 bg-background px-3 text-left text-sm shadow-sm transition-all",
          "hover:border-primary/40 hover:bg-muted/30 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span
          className={cn(
            "truncate font-medium",
            !selectedLabel && "font-normal text-muted-foreground"
          )}
        >
          {selectedLabel || placeholder}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {value != null && value !== "" && !disabled && (
            <span
              role="button"
              tabIndex={0}
              className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={handleClear}
              onKeyDown={(e) => e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)}
            >
              <X className="size-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </span>
      </button>

      {open && (
        <div className="absolute top-full z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-xl ring-1 ring-primary/10">
          <div className="border-b border-border/80 bg-muted/30 p-2.5">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="h-9 border-input/70 bg-background pl-9"
                autoFocus
              />
            </div>
          </div>
          <ul className="max-h-52 overflow-y-auto p-1.5">
            {loading && (
              <li className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-primary" />
                Loading...
              </li>
            )}
            {!loading && filtered.length === 0 && (
              <li className="py-8 text-center text-sm text-muted-foreground">
                No results found
              </li>
            )}
            {!loading &&
              filtered.map((row, idx) => {
                const val = readVal(row, selectedDataKey);
                const itemLabel =
                  readLabel(row, selectedDataKey) || "Unnamed";
                const selected = String(value) === val;
                return (
                  <li key={`${val}-${idx}`}>
                    <button
                      type="button"
                      className={cn(
                        "w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                        selected
                          ? "bg-primary/15 text-foreground"
                          : "hover:bg-muted/80"
                      )}
                      onClick={() => handleSelect(row)}
                    >
                      <span className="block truncate text-sm font-medium">
                        {itemLabel}
                      </span>
                      {showIdInList && (
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          ID: {val}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </div>
  );
}
