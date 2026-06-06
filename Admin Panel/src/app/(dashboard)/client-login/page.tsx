"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColDef } from "ag-grid-community";
import { PageShell } from "@/layout/PageShell";
import {
  DynamicTable,
  editRowAction,
  type TableRowAction,
} from "@/components/dynamicTable";
import { defaultListQuery } from "@/lib/list-query";
import { GetAllClientLoginList } from "@/services/api/client-login.api";
import { GetAllProjectRolesList } from "@/services/api/project-role-master.api";
import type { BackendLoginAccount } from "@/services/api/login.api";

export default function ClientLoginPage() {
  const router = useRouter();
  const [rows, setRows] = useState<BackendLoginAccount[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [roleNameById, setRoleNameById] = useState<Map<number, string>>(
    () => new Map()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      GetAllClientLoginList(defaultListQuery),
      GetAllProjectRolesList(defaultListQuery),
    ])
      .then(([accounts, roles]) => {
        setRows(accounts.rows as BackendLoginAccount[]);
        setTotalRows(accounts.total);
        setRoleNameById(
          new Map(
            roles.rows.map((r) => [r.id, `${r.role_name} (${r.code})`])
          )
        );
        setError("");
      })
      .catch((err) => {
        setRows([]);
        setTotalRows(0);
        setError(
          err instanceof Error ? err.message : "Failed to load login accounts"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columnDefs = useMemo<ColDef<BackendLoginAccount>[]>(
    () => [
      { field: "username", headerName: "Username", minWidth: 140 },
      { field: "email", headerName: "Email", minWidth: 200 },
      { field: "role", headerName: "System Role", maxWidth: 120 },
      {
        field: "project_role_id",
        headerName: "Project Role",
        minWidth: 180,
        valueFormatter: (p) => {
          const id = p.data?.project_role_id;
          if (id == null) return "—";
          return roleNameById.get(Number(id)) ?? `Role #${id}`;
        },
      },
      { field: "status", headerName: "Status", maxWidth: 120 },
    ],
    [roleNameById]
  );

  const rowActions = useMemo<TableRowAction<BackendLoginAccount>[]>(
    () => [
      editRowAction((row) => router.push(`/client-login/${row.id}/edit`)),
    ],
    [router]
  );

  return (
    <PageShell
      title="Client Login"
      description="Assign Project Role on each account for portal access after login"
    >
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <DynamicTable<BackendLoginAccount>
        rowData={rows}
        columnDefs={columnDefs}
        rowActions={rowActions}
        loading={loading}
        totalRowCount={totalRows}
        emptyMessage="No login accounts found"
      />
    </PageShell>
  );
}
