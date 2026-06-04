"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import { Plus } from "lucide-react";
import { PageShell } from "@/layout/PageShell";
import { Button } from "@/components/ui/button";
import {
  DynamicTable,
  editRowAction,
  viewRowAction,
  type TableRowAction,
} from "@/components/dynamicTable";
import type { ListQueryPayload } from "@/lib/filter-builder-v2";
import { GetAllClientManagementList } from "@/services/api/client-management.api";
import type { ClientManagementRow } from "@/types/client-management.types";
export default function ClientManagementPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const fetchClients = useCallback(
    async (query: ListQueryPayload) => {
      try {
        const result = await GetAllClientManagementList(query);
        setError("");
        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load clients"
        );
        return { rows: [], total: 0 };
      }
    },
    []
  );

  const columnDefs = useMemo<ColDef<ClientManagementRow>[]>(
    () => [
      {
        field: "company_name",
        headerName: "Company Name",
        minWidth: 180,
        valueFormatter: (p: ValueFormatterParams<ClientManagementRow>) =>
          p.value || "—",
      },
      {
        field: "owner_name",
        headerName: "Owner Name",
        minWidth: 160,
        valueFormatter: (p: ValueFormatterParams<ClientManagementRow>) =>
          p.value || "—",
      },
      { field: "mobile", headerName: "Mobile", minWidth: 130 },
      { field: "email", headerName: "Email", minWidth: 200 },
      {
        field: "project_name",
        headerName: "Project Name",
        minWidth: 160,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "plan_type",
        headerName: "Plan Type",
        minWidth: 140,
        valueFormatter: (p) => p.value || "—",
      },
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
      {
        field: "created_at",
        headerName: "Created",
        minWidth: 140,
      },
    ],
    []
  );

  const rowActions = useMemo<TableRowAction<ClientManagementRow>[]>(
    () => [
      viewRowAction((row) =>
        router.push(`/client-management/${row.id}`)
      ),
      editRowAction((row) =>
        router.push(`/client-management/${row.id}/edit`)
      ),
    ],
    [router]
  );

  return (
    <PageShell title="Client Management" description="Clients, plans, and login">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="mb-4 flex justify-end">
        <Button
          render={<Link href="/client-management/create" />}
          className="h-10 gap-2"
        >
          <Plus className="size-4" />
          Create Client
        </Button>
      </div>
      <DynamicTable<ClientManagementRow>
        rowData={[]}
        columnDefs={columnDefs}
        rowActions={rowActions}
        onServerFilter={fetchClients}
        dateFields={["created_at"]}
        emptyMessage="No clients found"
        height="560px"
      />
    </PageShell>
  );
}
