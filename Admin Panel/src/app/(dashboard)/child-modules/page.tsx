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
import { defaultListQuery } from "@/lib/list-query";
import {
  DeleteChildModule,
  GetAllChildModulesList,
  type ChildModuleRow,
} from "@/services/api/child-modules.api";

export default function ChildModulesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ChildModuleRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    GetAllChildModulesList(defaultListQuery)
      .then((result) => {
        setRows(result.rows);
        setTotalRows(result.total);
        setError("");
      })
      .catch((err) => {
        setRows([]);
        setTotalRows(0);
        setError(
          err instanceof Error ? err.message : "Failed to load child modules"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columnDefs = useMemo<ColDef<ChildModuleRow>[]>(
    () => [
      {
        field: "parent_module_name",
        headerName: "Parent Module",
        minWidth: 160,
        valueFormatter: (p: ValueFormatterParams<ChildModuleRow>) =>
          p.value || "—",
      },
      {
        field: "child_module_name",
        headerName: "Child Module",
        minWidth: 180,
        flex: 1,
      },
      { field: "created_at", headerName: "Created At", minWidth: 160 },
      {
        field: "created_by",
        headerName: "Created By",
        minWidth: 140,
        valueFormatter: (p: ValueFormatterParams<ChildModuleRow>) => {
          const row = p.data;
          if (row?.created_by_name) return row.created_by_name;
          if (p.value != null) return String(p.value);
          return "—";
        },
      },
    ],
    []
  );

  const rowActions = useMemo<TableRowAction<ChildModuleRow>[]>(
    () => [
      viewRowAction((row) => router.push(`/child-modules/${row.id}`)),
      editRowAction((row) => router.push(`/child-modules/${row.id}/edit`)),
      deleteRowAction(async (row) => {
        await DeleteChildModule(row.id);
        load();
      }),
    ],
    [load, router]
  );

  return (
    <PageShell title="Child Modules" description="Child module master">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="mb-4 flex justify-end">
        <Button
          render={<Link href="/child-modules/create" />}
          className="h-10 gap-2"
        >
          <Plus className="size-4" />
          Create Child Module
        </Button>
      </div>
      <DynamicTable<ChildModuleRow>
        rowData={rows}
        columnDefs={columnDefs}
        rowActions={rowActions}
        loading={loading}
        totalRowCount={totalRows}
        dateFields={["created_at"]}
        emptyMessage="No child modules found"
        height="560px"
      />
    </PageShell>
  );
}
