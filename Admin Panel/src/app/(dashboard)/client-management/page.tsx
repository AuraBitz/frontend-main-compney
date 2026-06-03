"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import { PageShell } from "@/layout/PageShell";
import { DynamicTable } from "@/components/dynamicTable";
import { GetAllClientManagementList } from "@/services/api/client-management.api";
import type { ClientManagementRow } from "@/types/client-management.types";
import { formatDate } from "@/utils/format-date";

function formatDateCell(
  params: ValueFormatterParams<ClientManagementRow, string | null>
) {
  if (!params.value) return "—";
  return formatDate(params.value);
}

export default function ClientManagementPage() {
  const [rows, setRows] = useState<ClientManagementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    GetAllClientManagementList({ skip: 0, limit: 100 })
      .then((data) => {
        setRows(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch((err) => {
        setRows([]);
        setError(err instanceof Error ? err.message : "Failed to load clients");
      })
      .finally(() => setLoading(false));
  }, []);

  const columnDefs = useMemo<ColDef<ClientManagementRow>[]>(
    () => [
      { field: "id", headerName: "ID", maxWidth: 80 },
      { field: "owner_name", headerName: "Owner", minWidth: 160 },
      { field: "mobile", headerName: "Mobile", minWidth: 130 },
      { field: "email", headerName: "Email", minWidth: 200 },
      { field: "city", headerName: "City", minWidth: 120 },
      { field: "state", headerName: "State", minWidth: 120 },
      { field: "country", headerName: "Country", minWidth: 120 },
      { field: "plan_status", headerName: "Plan Status", maxWidth: 130 },
      {
        field: "plan_remain_days",
        headerName: "Days Left",
        maxWidth: 110,
        valueFormatter: (p) =>
          p.value === null || p.value === undefined ? "—" : String(p.value),
      },
      { field: "login_id", headerName: "Login ID", maxWidth: 100 },
      {
        field: "created_at",
        headerName: "Created",
        minWidth: 140,
        valueFormatter: formatDateCell,
      },
    ],
    []
  );

  return (
    <PageShell title="Client Management" description="Clients, plans, and login">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <DynamicTable<ClientManagementRow>
        rowData={rows}
        columnDefs={columnDefs}
        loading={loading}
        emptyMessage="No clients found"
        height="560px"
      />
    </PageShell>
  );
}
