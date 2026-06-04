"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { PageShell } from "@/layout/PageShell";
import {
  DynamicTable,
  editRowAction,
  viewRowAction,
  type TableRowAction,
} from "@/components/dynamicTable";
import { defaultListQuery } from "@/lib/list-query";
import { notifyInfo } from "@/components/Notifications/notification";
import { GetAllClientLoginList } from "@/services/api/client-login.api";
import type { BackendLoginAccount } from "@/services/api/login.api";

export default function ClientLoginPage() {
  const [rows, setRows] = useState<BackendLoginAccount[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    GetAllClientLoginList(defaultListQuery)
      .then((result) => {
        setRows(result.rows as BackendLoginAccount[]);
        setTotalRows(result.total);
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

  const columnDefs = useMemo<ColDef<BackendLoginAccount>[]>(
    () => [
      { field: "id", headerName: "ID", maxWidth: 80 },
      { field: "username", headerName: "Username", minWidth: 140 },
      { field: "email", headerName: "Email", minWidth: 200 },
      { field: "role", headerName: "Role", maxWidth: 120 },
      { field: "status", headerName: "Status", maxWidth: 120 },
    ],
    []
  );

  const rowActions = useMemo<TableRowAction<BackendLoginAccount>[]>(
    () => [
      viewRowAction((row) =>
        notifyInfo(`View: ${row.username} (ID ${row.id})`)
      ),
      editRowAction((row) =>
        notifyInfo(`Edit: ${row.username} (ID ${row.id})`)
      ),
    ],
    []
  );

  return (
    <PageShell title="Client Login" description="Login accounts">
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
