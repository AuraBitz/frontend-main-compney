"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { PageShell } from "@/layout/PageShell";
import { DynamicTable } from "@/components/dynamicTable";
import { GetAllRolesList, type RoleMasterRow } from "@/services/api/roles.api";
import { defaultListQuery } from "@/lib/list-query";
export default function RoleMasterPage() {
  const [rows, setRows] = useState<RoleMasterRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    GetAllRolesList(defaultListQuery)
      .then((result) => {
        setRows(result.rows);
        setTotalRows(result.total);
        setError("");
      })
      .catch((err) => {
        setRows([]);
        setTotalRows(0);
        setError(err instanceof Error ? err.message : "Failed to load roles");
      })
      .finally(() => setLoading(false));
  }, []);

  const columnDefs = useMemo<ColDef<RoleMasterRow>[]>(
    () => [
      { field: "id", headerName: "ID", maxWidth: 80 },
      { field: "role_code", headerName: "Code", minWidth: 120 },
      { field: "role_name", headerName: "Role Name", minWidth: 160 },
      { field: "description", headerName: "Description", minWidth: 200 },
      { field: "status", headerName: "Status", maxWidth: 110 },
      {
        field: "created_at",
        headerName: "Created",
        minWidth: 140,
      },
    ],
    []
  );

  return (
    <PageShell title="Role Master" description="Manage application roles">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <DynamicTable<RoleMasterRow>
        rowData={rows}
        columnDefs={columnDefs}
        loading={loading}
        totalRowCount={totalRows}
        dateFields={["created_at"]}
        emptyMessage="No roles found"
        height="560px"
      />
    </PageShell>
  );
}
