"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import { Plus } from "lucide-react";
import { PageShell } from "@/layout/PageShell";
import { Button } from "@/components/ui/button";
import {
  DynamicTable,
  deleteRowAction,
  editRowAction,
  viewRowAction,
  type TableRowAction,
} from "@/components/dynamicTable";
import type { ParentModuleRow } from "@/lib/parent-module-form-config";
import { defaultListQuery } from "@/lib/list-query";
import { withStatusSetFilter } from "@/lib/table-column-utils";
import {
  DeleteParentModule,
  GetAllParentModulesList,
} from "@/services/api/parent-modules.api";

export default function ParentModulesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ParentModuleRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    GetAllParentModulesList(defaultListQuery)
      .then((result) => {
        setRows(result.rows);
        setTotalRows(result.total);
        setError("");
      })
      .catch((err) => {
        setRows([]);
        setTotalRows(0);
        setError(
          err instanceof Error ? err.message : "Failed to load parent modules"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columnDefs = useMemo<ColDef<ParentModuleRow>[]>(
    () =>
      withStatusSetFilter([
        { field: "module_name", headerName: "Module Name", minWidth: 180, flex: 1 },
        {
          field: "project_name",
          headerName: "Project",
          minWidth: 160,
          valueFormatter: (p: ValueFormatterParams<ParentModuleRow>) =>
            p.value || "—",
        },
        { field: "status", headerName: "Status", minWidth: 120 },
        { field: "created_at", headerName: "Created At", minWidth: 160 },
        {
          field: "created_by",
          headerName: "Created By",
          minWidth: 140,
          valueFormatter: (p: ValueFormatterParams<ParentModuleRow>) => {
            const row = p.data;
            if (row?.created_by_name) return row.created_by_name;
            if (p.value != null) return String(p.value);
            return "—";
          },
        },
      ]),
    []
  );

  const rowActions = useMemo<TableRowAction<ParentModuleRow>[]>(
    () => [
      viewRowAction((row) => router.push(`/parent-modules/${row.id}`)),
      editRowAction((row) => router.push(`/parent-modules/${row.id}/edit`)),
      deleteRowAction(async (row) => {
        await DeleteParentModule(row.id);
        load();
      }),
    ],
    [load, router]
  );

  return (
    <PageShell title="Parent Modules" description="Parent module master">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="mb-4 flex justify-end">
        <Button
          render={<Link href="/parent-modules/create" />}
          className="h-10 gap-2"
        >
          <Plus className="size-4" />
          Create Parent Module
        </Button>
      </div>
      <DynamicTable<ParentModuleRow>
        rowData={rows}
        columnDefs={columnDefs}
        rowActions={rowActions}
        loading={loading}
        totalRowCount={totalRows}
        dateFields={["created_at"]}
        emptyMessage="No parent modules found"
        height="560px"
      />
    </PageShell>
  );
}
