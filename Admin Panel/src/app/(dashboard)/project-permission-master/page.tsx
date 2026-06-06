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
  DeleteProjectPermission,
  GetAllProjectPermissionsList,
} from "@/services/api/project-permission-master.api";
import type { ProjectPermissionMasterRow } from "@/types/project-permission-master.types";

export default function ProjectPermissionMasterPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ProjectPermissionMasterRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    GetAllProjectPermissionsList(defaultListQuery)
      .then((result) => {
        setRows(result.rows);
        setTotalRows(result.total);
        setError("");
      })
      .catch((err) => {
        setRows([]);
        setTotalRows(0);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load project permissions"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columnDefs = useMemo<ColDef<ProjectPermissionMasterRow>[]>(
    () => [
      {
        field: "role_names",
        headerName: "Roles",
        minWidth: 220,
        flex: 1,
        valueFormatter: (p: ValueFormatterParams<ProjectPermissionMasterRow>) => {
          const row = p.data;
          if (row?.role_names) return row.role_names;
          const count = row?.role_ids?.length ?? 0;
          return count ? `${count} role${count === 1 ? "" : "s"}` : "—";
        },
      },
      {
        field: "overall_access",
        headerName: "Overall Access",
        minWidth: 140,
        valueFormatter: (p: ValueFormatterParams<ProjectPermissionMasterRow>) =>
          p.data?.overall_access ? "Yes" : "No",
      },
      {
        field: "project_ids",
        headerName: "Projects",
        minWidth: 180,
        flex: 1,
        valueFormatter: (p: ValueFormatterParams<ProjectPermissionMasterRow>) => {
          const row = p.data;
          if (row?.overall_access) return "Management portal";
          const count = row?.project_ids?.length ?? 0;
          return count ? `${count} project${count === 1 ? "" : "s"}` : "—";
        },
      },
      { field: "created_at", headerName: "Created At", minWidth: 160 },
    ],
    []
  );

  const rowActions = useMemo<TableRowAction<ProjectPermissionMasterRow>[]>(
    () => [
      viewRowAction((row) =>
        router.push(`/project-permission-master/${row.id}`)
      ),
      editRowAction((row) =>
        router.push(`/project-permission-master/${row.id}/edit`)
      ),
      deleteRowAction(async (row) => {
        await DeleteProjectPermission(row.id);
        load();
      }),
    ],
    [load, router]
  );

  return (
    <PageShell
      title="Project Permission Master"
      description="Control role-based access to the management portal or specific project portals"
    >
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="mb-4 flex justify-end">
        <Button
          render={<Link href="/project-permission-master/create" />}
          className="h-10 gap-2"
        >
          <Plus className="size-4" />
          Create Permission
        </Button>
      </div>
      <DynamicTable<ProjectPermissionMasterRow>
        rowData={rows}
        columnDefs={columnDefs}
        rowActions={rowActions}
        loading={loading}
        totalRowCount={totalRows}
        dateFields={["created_at"]}
        emptyMessage="No project permissions found"
        height="560px"
      />
    </PageShell>
  );
}
