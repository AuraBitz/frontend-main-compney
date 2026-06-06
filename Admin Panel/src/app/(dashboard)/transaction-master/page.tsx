"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import { Plus } from "lucide-react";
import { PageShell } from "@/layout/PageShell";
import { ReportDownloadToolbar } from "@/components/report/ReportDownloadToolbar";
import { Button } from "@/components/ui/button";
import {
  DynamicTable,
  deleteRowAction,
  editRowAction,
  viewRowAction,
  type TableRowAction,
} from "@/components/dynamicTable";
import { defaultListQuery } from "@/lib/list-query";
import {
  DeleteTransaction,
  DownloadTransactionsMasterReport,
  GetAllTransactionsList,
  type TransactionMasterRow,
} from "@/services/api/transactions.api";

export default function TransactionMasterPage() {
  const router = useRouter();
  const [rows, setRows] = useState<TransactionMasterRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    GetAllTransactionsList(defaultListQuery)
      .then((result) => {
        setRows(result.rows);
        setTotalRows(result.total);
        setError("");
      })
      .catch((err) => {
        setRows([]);
        setTotalRows(0);
        setError(
          err instanceof Error ? err.message : "Failed to load transactions"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const displayOrDash = (
    p: ValueFormatterParams<TransactionMasterRow>,
    labelKey: keyof TransactionMasterRow,
    idKey: keyof TransactionMasterRow
  ) => {
    const row = p.data;
    const label = row?.[labelKey];
    if (label != null && String(label).trim()) return String(label);
    const id = row?.[idKey];
    if (id != null) return String(id);
    return "—";
  };

  const columnDefs = useMemo<ColDef<TransactionMasterRow>[]>(
    () => [
      {
        field: "payment_type",
        headerName: "Payment Type",
        minWidth: 140,
        valueFormatter: (p) => displayOrDash(p, "payment_type", "payment_type_id"),
      },
      { field: "account", headerName: "Account", minWidth: 140 },
      {
        field: "project_name",
        headerName: "Project",
        minWidth: 150,
        valueFormatter: (p) => displayOrDash(p, "project_name", "project_id"),
      },
      { field: "number", headerName: "Number", minWidth: 120 },
      {
        field: "transaction_no",
        headerName: "Transaction No",
        minWidth: 160,
        flex: 1,
      },
      {
        field: "customer_name",
        headerName: "Customer",
        minWidth: 160,
        valueFormatter: (p) => displayOrDash(p, "customer_name", "customer_id"),
      },
      {
        field: "transaction_date",
        headerName: "Transaction Date",
        minWidth: 160,
      },
      {
        field: "plan_type",
        headerName: "Plan",
        minWidth: 140,
        valueFormatter: (p) => displayOrDash(p, "plan_type", "plan_id"),
      },
      { field: "created_at", headerName: "Created At", minWidth: 160 },
    ],
    []
  );

  const rowActions = useMemo<TableRowAction<TransactionMasterRow>[]>(
    () => [
      viewRowAction((row) => router.push(`/transaction-master/${row.id}`)),
      editRowAction((row) => router.push(`/transaction-master/${row.id}/edit`)),
      deleteRowAction(async (row) => {
        await DeleteTransaction(row.id);
        load();
      }),
    ],
    [load, router]
  );

  return (
    <PageShell
      title="Transaction Master"
      description="Manage payment transactions"
    >
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <ReportDownloadToolbar onDownload={DownloadTransactionsMasterReport} />
        <Button
          render={<Link href="/transaction-master/create" />}
          className="h-10 gap-2"
        >
          <Plus className="size-4" />
          Create Transaction
        </Button>
      </div>
      <DynamicTable<TransactionMasterRow>
        rowData={rows}
        columnDefs={columnDefs}
        rowActions={rowActions}
        loading={loading}
        totalRowCount={totalRows}
        dateFields={["transaction_date", "created_at"]}
        emptyMessage="No transactions found"
        height="560px"
      />
    </PageShell>
  );
}
