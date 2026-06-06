"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import { PageShell } from "@/layout/PageShell";
import { ReportDownloadToolbar } from "@/components/report/ReportDownloadToolbar";
import {
  DynamicTable,
  editRowAction,
  viewRowAction,
  type TableRowAction,
} from "@/components/dynamicTable";
import type { ListQueryPayload } from "@/lib/filter-builder-v2";
import {
  DownloadClientsMasterReport,
  GetAllClientManagementList,
} from "@/services/api/client-management.api";
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
        field: "restaurant_name",
        headerName: "Restaurant Name",
        minWidth: 180,
        valueFormatter: (p: ValueFormatterParams<ClientManagementRow>) =>
          p.value || "—",
      },
      {
        field: "owner_name",
        headerName: "Owner",
        minWidth: 160,
        valueFormatter: (p: ValueFormatterParams<ClientManagementRow>) =>
          p.value || "—",
      },
      {
        field: "mobile",
        headerName: "Mobile",
        minWidth: 130,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "email",
        headerName: "Email",
        minWidth: 200,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "plan_type",
        headerName: "Plan Type",
        minWidth: 140,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "plan_remain_days",
        headerName: "Plan Remaining Days",
        minWidth: 150,
        valueFormatter: (p) =>
          p.value == null ? "—" : `${p.value} days`,
      },
      {
        field: "created_at",
        headerName: "Joined At",
        minWidth: 150,
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
      <div className="mb-4">
        <ReportDownloadToolbar onDownload={DownloadClientsMasterReport} />
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
