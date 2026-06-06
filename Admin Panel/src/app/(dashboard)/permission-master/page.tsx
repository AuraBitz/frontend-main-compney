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
import { countConfiguredModules } from "@/lib/permission-modules";
import { defaultListQuery } from "@/lib/list-query";
import {
  DeletePermission,
  GetAllPermissionsList,
} from "@/services/api/permissions.api";
import type { PermissionMasterRow } from "@/types/permission-master.types";

export default function PermissionMasterPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PermissionMasterRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    GetAllPermissionsList(defaultListQuery)
      .then((result) => {
        setRows(result.rows);
        setTotalRows(result.total);
        setError("");
      })
      .catch((err) => {
        setRows([]);
        setTotalRows(0);
        setError(
          err instanceof Error ? err.message : "Failed to load permissions"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columnDefs = useMemo<ColDef<PermissionMasterRow>[]>(
    () => [
      {
        field: "role_name",
        headerName: "Role",
        minWidth: 180,
        flex: 1,
        valueFormatter: (p: ValueFormatterParams<PermissionMasterRow>) => {
          const row = p.data;
          if (row?.role_name) {
            return row.role_code
              ? `${row.role_name} (${row.role_code})`
              : row.role_name;
          }
          if (row?.role_id != null) return String(row.role_id);
          return "—";
        },
      },
      {
        field: "modules",
        headerName: "Modules Configured",
        minWidth: 180,
        valueFormatter: (p: ValueFormatterParams<PermissionMasterRow>) => {
          const modules = p.data?.modules;
          if (!modules || typeof modules !== "object") return "0";
          return String(countConfiguredModules(modules));
        },
      },
      { field: "created_at", headerName: "Created At", minWidth: 160 },
    ],
    []
  );

  const rowActions = useMemo<TableRowAction<PermissionMasterRow>[]>(
    () => [
      viewRowAction((row) => router.push(`/permission-master/${row.id}`)),
      editRowAction((row) => router.push(`/permission-master/${row.id}/edit`)),
      deleteRowAction(async (row) => {
        await DeletePermission(row.id);
        load();
      }),
    ],
    [load, router]
  );

  return (
    <PageShell
      title="Permission Master"
      description="Role-wise module access (view, create, edit, delete, download)"
    >
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="mb-4 flex justify-end">
        <Button
          render={<Link href="/permission-master/create" />}
          className="h-10 gap-2"
        >
          <Plus className="size-4" />
          Create Permission
        </Button>
      </div>
      <DynamicTable<PermissionMasterRow>
        rowData={rows}
        columnDefs={columnDefs}
        rowActions={rowActions}
        loading={loading}
        totalRowCount={totalRows}
        dateFields={["created_at"]}
        emptyMessage="No permissions found"
        height="560px"
      />
    </PageShell>
  );
}
