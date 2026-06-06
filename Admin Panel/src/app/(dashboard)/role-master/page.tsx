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
import {
  buildProjectNameMap,
  formatProjectIdsAsNames,
} from "@/lib/format-project-labels";
import { defaultListQuery } from "@/lib/list-query";
import { withStatusSetFilter } from "@/lib/table-column-utils";
import { GetAllProjectsList } from "@/services/api/projects.api";
import {
  DeleteRole,
  GetAllRolesList,
  type RoleMasterRow,
} from "@/services/api/roles.api";

export default function RoleMasterPage() {
  const router = useRouter();
  const [rows, setRows] = useState<RoleMasterRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [projectNameById, setProjectNameById] = useState<Map<number, string>>(
    () => new Map()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      GetAllRolesList(defaultListQuery),
      GetAllProjectsList(defaultListQuery),
    ])
      .then(([roles, projects]) => {
        setRows(roles.rows);
        setTotalRows(roles.total);
        setProjectNameById(buildProjectNameMap(projects.rows));
        setError("");
      })
      .catch((err) => {
        setRows([]);
        setTotalRows(0);
        setError(err instanceof Error ? err.message : "Failed to load roles");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const formatProjects = useCallback(
    (params: ValueFormatterParams<RoleMasterRow, number[]>) =>
      formatProjectIdsAsNames(params.value, projectNameById),
    [projectNameById]
  );

  const columnDefs = useMemo<ColDef<RoleMasterRow>[]>(
    () =>
      withStatusSetFilter([
        { field: "role_name", headerName: "Role Name", minWidth: 160 },
        {
          field: "project_ids",
          headerName: "Projects",
          minWidth: 200,
          flex: 1.2,
          valueFormatter: formatProjects,
        },
        {
          field: "status",
          headerName: "Status",
          minWidth: 120,
        },
        {
          field: "created_at",
          headerName: "Created At",
          minWidth: 160,
        },
        {
          field: "created_by",
          headerName: "Created By",
          minWidth: 140,
          valueFormatter: (p: ValueFormatterParams<RoleMasterRow>) => {
            const row = p.data;
            if (row?.created_by_name) return row.created_by_name;
            if (p.value != null) return String(p.value);
            return "—";
          },
        },
      ]),
    [formatProjects]
  );

  const rowActions = useMemo<TableRowAction<RoleMasterRow>[]>(
    () => [
      viewRowAction((row) => router.push(`/role-master/${row.id}`)),
      editRowAction((row) => router.push(`/role-master/${row.id}/edit`)),
      deleteRowAction(async (row) => {
        await DeleteRole(row.id);
        load();
      }),
    ],
    [load, router]
  );

  return (
    <PageShell title="Role Master" description="Manage application roles">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="mb-4 flex justify-end">
        <Button
          render={<Link href="/role-master/create" />}
          className="h-10 gap-2"
        >
          <Plus className="size-4" />
          Create Role
        </Button>
      </div>
      <DynamicTable<RoleMasterRow>
        rowData={rows}
        columnDefs={columnDefs}
        rowActions={rowActions}
        loading={loading}
        totalRowCount={totalRows}
        dateFields={["created_at"]}
        emptyMessage="No roles found"
        height="560px"
      />
    </PageShell>
  );
}
