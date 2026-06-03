"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { PageShell } from "@/layout/PageShell";
import { DynamicTable } from "@/components/dynamicTable";
import { GetAllClientLoginList } from "@/services/api/client-login.api";
import type { BackendLoginAccount } from "@/services/api/login.api";

export default function ClientLoginPage() {
  const [rows, setRows] = useState<BackendLoginAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    GetAllClientLoginList({ skip: 0, limit: 100 })
      .then((data) => {
        setRows(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch((err) => {
        setRows([]);
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
        loading={loading}
        emptyMessage="No login accounts found"
      />
    </PageShell>
  );
}
