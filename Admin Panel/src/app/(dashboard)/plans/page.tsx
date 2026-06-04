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
  DeletePlan,
  GetAllPlansList,
  type PlanMasterRow,
} from "@/services/api/plans.api";
import { GetAllParentModulesList } from "@/services/api/parent-modules.api";
import { defaultListQuery } from "@/lib/list-query";
import {
  buildModuleNameMap,
  formatModuleIdsAsNames,
} from "@/lib/format-module-labels";

export default function PlanMasterPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PlanMasterRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [moduleNameById, setModuleNameById] = useState<Map<number, string>>(
    () => new Map()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      GetAllPlansList(defaultListQuery),
      GetAllParentModulesList(defaultListQuery),
    ])
      .then(([plans, moduleData]) => {
        setRows(plans.rows);
        setTotalRows(plans.total);
        setModuleNameById(buildModuleNameMap(moduleData.rows));
        setError("");
      })
      .catch((err) => {
        setRows([]);
        setTotalRows(0);
        setError(err instanceof Error ? err.message : "Failed to load plans");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const formatModules = useCallback(
    (params: ValueFormatterParams<PlanMasterRow, number[]>) =>
      formatModuleIdsAsNames(params.value, moduleNameById),
    [moduleNameById]
  );

  const columnDefs = useMemo<ColDef<PlanMasterRow>[]>(
    () => [
      {
        field: "project_name",
        headerName: "Project",
        minWidth: 160,
        valueFormatter: (p) => p.value || "—",
      },
      { field: "plan_type", headerName: "Plan Type", minWidth: 140 },
      {
        field: "amount",
        headerName: "Amount",
        maxWidth: 110,
        valueFormatter: (p) =>
          p.value != null ? String(p.value) : "—",
      },
      {
        field: "plan_valid_days",
        headerName: "Valid Days",
        maxWidth: 110,
      },
      {
        field: "plan_modules_id",
        headerName: "Modules",
        minWidth: 200,
        flex: 1.2,
        valueFormatter: formatModules,
      },
      {
        field: "discount_amount",
        headerName: "Discount",
        maxWidth: 110,
        valueFormatter: (p) =>
          p.value != null && Number(p.value) > 0 ? String(p.value) : "—",
      },
      {
        field: "created_at",
        headerName: "Created",
        minWidth: 140,
      },
    ],
    [formatModules]
  );

  const rowActions = useMemo<TableRowAction<PlanMasterRow>[]>(
    () => [
      viewRowAction((row) => router.push(`/plans/${row.id}`)),
      editRowAction((row) => router.push(`/plans/${row.id}/edit`)),
      deleteRowAction(async (row) => {
        await DeletePlan(row.id);
        load();
      }),
    ],
    [load, router]
  );

  return (
    <PageShell title="Plan Master" description="Manage subscription plans">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="mb-4 flex justify-end">
        <Button
          render={<Link href="/plans/create" />}
          className="h-10 gap-2"
        >
          <Plus className="size-4" />
          Create Plan
        </Button>
      </div>
      <DynamicTable<PlanMasterRow>
        rowData={rows}
        columnDefs={columnDefs}
        rowActions={rowActions}
        loading={loading}
        totalRowCount={totalRows}
        dateFields={["created_at"]}
        emptyMessage="No plans found"
        height="560px"
      />
    </PageShell>
  );
}
