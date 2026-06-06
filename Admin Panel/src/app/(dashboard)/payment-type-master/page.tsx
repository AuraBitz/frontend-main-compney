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
import { defaultListQuery } from "@/lib/list-query";
import { withStatusSetFilter } from "@/lib/table-column-utils";
import {
  DeletePaymentType,
  GetAllPaymentTypesList,
  type PaymentTypeMasterRow,
} from "@/services/api/payment-type.api";

export default function PaymentTypeMasterPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PaymentTypeMasterRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    GetAllPaymentTypesList(defaultListQuery)
      .then((result) => {
        setRows(result.rows);
        setTotalRows(result.total);
        setError("");
      })
      .catch((err) => {
        setRows([]);
        setTotalRows(0);
        setError(
          err instanceof Error ? err.message : "Failed to load payment types"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columnDefs = useMemo<ColDef<PaymentTypeMasterRow>[]>(
    () =>
      withStatusSetFilter([
        { field: "type", headerName: "Type", minWidth: 180, flex: 1 },
        { field: "status", headerName: "Status", minWidth: 120 },
        { field: "created_at", headerName: "Created At", minWidth: 160 },
        {
          field: "created_by",
          headerName: "Created By",
          minWidth: 140,
          valueFormatter: (p: ValueFormatterParams<PaymentTypeMasterRow>) => {
            const row = p.data;
            if (row?.created_by_name) return row.created_by_name;
            if (p.value != null) return String(p.value);
            return "—";
          },
        },
      ]),
    []
  );

  const rowActions = useMemo<TableRowAction<PaymentTypeMasterRow>[]>(
    () => [
      viewRowAction((row) => router.push(`/payment-type-master/${row.id}`)),
      editRowAction((row) => router.push(`/payment-type-master/${row.id}/edit`)),
      deleteRowAction(async (row) => {
        await DeletePaymentType(row.id);
        load();
      }),
    ],
    [load, router]
  );

  return (
    <PageShell
      title="Payment Type Master"
      description="Manage payment types (UPI, Cash, Bank, etc.)"
    >
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="mb-4 flex justify-end">
        <Button
          render={<Link href="/payment-type-master/create" />}
          className="h-10 gap-2"
        >
          <Plus className="size-4" />
          Create Payment Type
        </Button>
      </div>
      <DynamicTable<PaymentTypeMasterRow>
        rowData={rows}
        columnDefs={columnDefs}
        rowActions={rowActions}
        loading={loading}
        totalRowCount={totalRows}
        dateFields={["created_at"]}
        emptyMessage="No payment types found"
        height="560px"
      />
    </PageShell>
  );
}
