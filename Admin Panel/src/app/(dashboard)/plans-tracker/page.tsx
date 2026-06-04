"use client";

import { useCallback, useMemo, useState } from "react";
import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import { PageShell } from "@/layout/PageShell";
import { DynamicTable } from "@/components/dynamicTable";
import type { ListQueryPayload } from "@/lib/filter-builder-v2";
import { GetAllPlansTrackerList } from "@/services/api/plans-tracker.api";
import type { PlansTrackerRow } from "@/types/plans-tracker.types";

function formatAmount(
  params: ValueFormatterParams<PlansTrackerRow, number | string | null>
) {
  if (params.value == null || params.value === "") return "—";
  const n = Number(params.value);
  return Number.isFinite(n) ? `₹${n.toLocaleString()}` : String(params.value);
}

export default function PlansTrackerPage() {
  const [error, setError] = useState("");

  const fetchRows = useCallback(async (query: ListQueryPayload) => {
    try {
      const result = await GetAllPlansTrackerList(query);
      setError("");
      return result;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load plans tracker"
      );
      return { rows: [], total: 0 };
    }
  }, []);

  const columnDefs = useMemo<ColDef<PlansTrackerRow>[]>(
    () => [
      {
        field: "client_name",
        headerName: "Client Name",
        minWidth: 180,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "username",
        headerName: "Username",
        minWidth: 140,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "plan_type",
        headerName: "Plan Type",
        minWidth: 140,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "plan_amount",
        headerName: "Plan Amount",
        minWidth: 120,
        valueFormatter: formatAmount,
      },
      {
        field: "plan_validity",
        headerName: "Plan Validity",
        maxWidth: 120,
        valueFormatter: (p) =>
          p.value != null ? `${p.value} days` : "—",
      },
      {
        field: "purchase_at",
        headerName: "Purchased At",
        minWidth: 150,
      },
    ],
    []
  );

  return (
    <PageShell
      title="Plans Tracker"
      description="Plan purchase history per client"
    >
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <DynamicTable<PlansTrackerRow>
        rowData={[]}
        columnDefs={columnDefs}
        onServerFilter={fetchRows}
        dateFields={["purchase_at"]}
        emptyMessage="No plan purchases recorded yet"
        height="560px"
      />
    </PageShell>
  );
}
