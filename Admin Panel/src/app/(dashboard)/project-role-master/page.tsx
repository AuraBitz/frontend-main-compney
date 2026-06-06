"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColDef } from "ag-grid-community";
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
import { withStatusSetFilter } from "@/lib/table-column-utils";
import {
  DeleteProjectRole,
  GetAllProjectRolesList,
} from "@/services/api/project-role-master.api";
import type { ProjectRoleMasterRow } from "@/types/project-role-master.types";

export default function ProjectRoleMasterPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ProjectRoleMasterRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    GetAllProjectRolesList(defaultListQuery)
      .then((result) => {
        setRows(result.rows);
        setTotalRows(result.total);
        setError("");
      })
      .catch((err) => {
        setRows([]);
        setTotalRows(0);
        setError(
          err instanceof Error ? err.message : "Failed to load project roles"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columnDefs = useMemo<ColDef<ProjectRoleMasterRow>[]>(
    () =>
      withStatusSetFilter([
        { field: "code", headerName: "Code", minWidth: 140 },
        { field: "role_name", headerName: "Role Name", minWidth: 180, flex: 1 },
        {
          field: "description",
          headerName: "Description",
          minWidth: 200,
          flex: 1,
        },
        { field: "status", headerName: "Status", minWidth: 120 },
        { field: "created_at", headerName: "Created At", minWidth: 160 },
      ]),
    []
  );

  const rowActions = useMemo<TableRowAction<ProjectRoleMasterRow>[]>(
    () => [
      viewRowAction((row) => router.push(`/project-role-master/${row.id}`)),
      editRowAction((row) => router.push(`/project-role-master/${row.id}/edit`)),
      deleteRowAction(async (row) => {
        await DeleteProjectRole(row.id);
        load();
      }),
    ],
    [load, router]
  );

  return (
    <PageShell
      title="Project Role Master"
      description="Roles used for project permission and login-based portal access"
    >
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="mb-4 flex justify-end">
        <Button
          render={<Link href="/project-role-master/create" />}
          className="h-10 gap-2"
        >
          <Plus className="size-4" />
          Create Role
        </Button>
      </div>
      <DynamicTable<ProjectRoleMasterRow>
        rowData={rows}
        columnDefs={columnDefs}
        rowActions={rowActions}
        loading={loading}
        totalRowCount={totalRows}
        dateFields={["created_at"]}
        emptyMessage="No project roles found"
        height="560px"
      />
    </PageShell>
  );
}
