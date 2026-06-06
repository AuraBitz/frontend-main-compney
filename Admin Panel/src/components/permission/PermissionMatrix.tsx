"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { flattenPermissionModules } from "@/lib/permission-modules";
import {
  PERMISSION_ACTIONS,
  type ModulePermissionFlags,
  type ModulesPermissionMap,
  type PermissionActionKey,
  type PermissionModuleGroup,
} from "@/types/permission-master.types";

/** Create / Edit / Delete / Download require View */
const VIEW_DEPENDENT_ACTIONS: PermissionActionKey[] = [
  "create",
  "edit",
  "delete",
  "download",
];

interface PermissionMatrixProps {
  moduleRows: PermissionModuleGroup[];
  value: ModulesPermissionMap;
  onChange?: (next: ModulesPermissionMap) => void;
  readOnly?: boolean;
}

function hasViewDependentAction(flags: ModulePermissionFlags): boolean {
  return VIEW_DEPENDENT_ACTIONS.some((key) => flags[key]);
}

function normalizeRowFlags(flags: ModulePermissionFlags): ModulePermissionFlags {
  const next = { ...flags };
  if (hasViewDependentAction(next)) {
    next.view = true;
  }
  return next;
}

function emptyRowFlags(): ModulePermissionFlags {
  return {
    view: false,
    create: false,
    edit: false,
    delete: false,
    download: false,
  };
}

function fullRowFlags(): ModulePermissionFlags {
  return {
    view: true,
    create: true,
    edit: true,
    delete: true,
    download: true,
  };
}

export function PermissionMatrix({
  moduleRows,
  value,
  onChange,
  readOnly = false,
}: PermissionMatrixProps) {
  const flatRows = useMemo(
    () => flattenPermissionModules(moduleRows),
    [moduleRows]
  );

  const [expandedParents, setExpandedParents] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const group of moduleRows) {
      if (group.children.length > 0) {
        initial.add(group.key);
      }
    }
    return initial;
  });

  const isColumnAllSelected = (action: PermissionActionKey) =>
    flatRows.length > 0 &&
    flatRows.every((row) => Boolean(value[row.key]?.[action]));

  const isRowAllSelected = (moduleKey: string) => {
    const flags = value[moduleKey];
    if (!flags) return false;
    return PERMISSION_ACTIONS.every((action) => flags[action.key]);
  };

  const updateRow = (moduleKey: string, flags: ModulePermissionFlags) => {
    if (readOnly || !onChange) return;
    onChange({
      ...value,
      [moduleKey]: normalizeRowFlags(flags),
    });
  };

  const toggle = (
    moduleKey: string,
    action: PermissionActionKey,
    checked: boolean
  ) => {
    if (readOnly || !onChange) return;
    const current = value[moduleKey];
    if (!current) return;

    if (action === "view" && !checked && hasViewDependentAction(current)) {
      return;
    }

    updateRow(moduleKey, { ...current, [action]: checked });
  };

  const toggleColumn = (action: PermissionActionKey) => {
    if (readOnly || !onChange) return;
    const selectAll = !isColumnAllSelected(action);
    const next = { ...value };

    for (const row of flatRows) {
      const current = next[row.key];
      if (!current) continue;

      if (action === "view" && !selectAll) {
        next[row.key] = normalizeRowFlags({
          ...current,
          view: hasViewDependentAction(current) ? true : false,
        });
        continue;
      }

      next[row.key] = normalizeRowFlags({
        ...current,
        [action]: selectAll,
      });
    }

    onChange(next);
  };

  const toggleRow = (moduleKey: string) => {
    if (readOnly || !onChange) return;
    const selectAll = !isRowAllSelected(moduleKey);
    updateRow(moduleKey, selectAll ? fullRowFlags() : emptyRowFlags());
  };

  const toggleParentExpand = (parentKey: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(parentKey)) {
        next.delete(parentKey);
      } else {
        next.add(parentKey);
      }
      return next;
    });
  };

  const renderCheckboxCells = (
    moduleKey: string,
    label: string,
    flags: ModulePermissionFlags
  ) =>
    PERMISSION_ACTIONS.map((action) => {
      const isView = action.key === "view";
      const viewLocked = hasViewDependentAction(flags);
      const disabled = readOnly || (isView && viewLocked);

      return (
        <td key={action.key} className="px-3 py-3 text-center">
          <input
            type="checkbox"
            checked={Boolean(flags[action.key])}
            disabled={disabled}
            onChange={(e) => toggle(moduleKey, action.key, e.target.checked)}
            className={cn(
              "size-4 rounded border-input accent-primary",
              disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
            )}
            aria-label={`${label} ${action.label}`}
          />
        </td>
      );
    });

  if (!moduleRows.length) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        No modules found. Add parent or child modules first.
      </p>
    );
  }

  let rowIndex = 0;

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <table className="w-full min-w-[780px] border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              Module
            </th>
            {PERMISSION_ACTIONS.map((action) => {
              const allSelected = isColumnAllSelected(action.key);
              return (
                <th
                  key={action.key}
                  className="px-3 py-3 text-center font-semibold text-foreground"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{action.label}</span>
                    {!readOnly && (
                      <button
                        type="button"
                        className="text-xs font-medium text-primary hover:underline"
                        onClick={() => toggleColumn(action.key)}
                      >
                        {allSelected ? "Clear" : "All"}
                      </button>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {moduleRows.map((group) => {
            const parentFlags = value[group.key];
            if (!parentFlags) return null;

            const hasChildren = group.children.length > 0;
            const isExpanded = expandedParents.has(group.key);
            const parentRowAllSelected = isRowAllSelected(group.key);
            const parentStripe =
              rowIndex % 2 === 0 ? "bg-background" : "bg-muted/15";
            rowIndex += 1;

            const rows = [
              <tr key={group.key} className={cn("border-b", parentStripe)}>
                <td className="px-4 py-3 font-medium text-foreground">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      className={cn(
                        "flex min-w-0 flex-1 items-center gap-2 text-left",
                        hasChildren && "cursor-pointer hover:text-primary"
                      )}
                      onClick={() =>
                        hasChildren && toggleParentExpand(group.key)
                      }
                      disabled={!hasChildren}
                      aria-expanded={hasChildren ? isExpanded : undefined}
                    >
                      {hasChildren ? (
                        <ChevronRight
                          className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                            isExpanded && "rotate-90 text-primary"
                          )}
                        />
                      ) : (
                        <span className="inline-block size-4 shrink-0" />
                      )}
                      <span className="truncate font-semibold">
                        {group.label}
                      </span>
                      {hasChildren && (
                        <span className="shrink-0 text-xs font-normal text-muted-foreground">
                          ({group.children.length})
                        </span>
                      )}
                    </button>
                    {!readOnly && (
                      <button
                        type="button"
                        className="shrink-0 text-xs font-medium text-primary hover:underline"
                        onClick={() => toggleRow(group.key)}
                      >
                        {parentRowAllSelected ? "Clear" : "All"}
                      </button>
                    )}
                  </div>
                </td>
                {renderCheckboxCells(group.key, group.label, parentFlags)}
              </tr>,
            ];

            if (hasChildren && isExpanded) {
              for (const child of group.children) {
                const childFlags = value[child.key];
                if (!childFlags) continue;

                const childRowAllSelected = isRowAllSelected(child.key);
                const childStripe =
                  rowIndex % 2 === 0 ? "bg-background" : "bg-muted/15";
                rowIndex += 1;

                rows.push(
                  <tr key={child.key} className={cn("border-b", childStripe)}>
                    <td className="px-4 py-2.5 text-foreground">
                      <div className="flex items-center justify-between gap-2 pl-8">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="size-1.5 shrink-0 rounded-full bg-primary/50" />
                          <span className="truncate text-sm">{child.label}</span>
                        </div>
                        {!readOnly && (
                          <button
                            type="button"
                            className="shrink-0 text-xs font-medium text-primary hover:underline"
                            onClick={() => toggleRow(child.key)}
                          >
                            {childRowAllSelected ? "Clear" : "All"}
                          </button>
                        )}
                      </div>
                    </td>
                    {renderCheckboxCells(
                      child.key,
                      `${group.label} ${child.label}`,
                      childFlags
                    )}
                  </tr>
                );
              }
            }

            return rows;
          })}
        </tbody>
      </table>
    </div>
  );
}
