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
  DeleteEmployee,
  GetAllEmployeesList,
} from "@/services/api/employee-master.api";
import type { EmployeeMasterRow } from "@/types/employee-master.types";

export default function EmployeeMasterPage() {
  const router = useRouter();
  const [rows, setRows] = useState<EmployeeMasterRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    GetAllEmployeesList(defaultListQuery)
      .then((result) => {
        setRows(result.rows);
        setTotalRows(result.total);
        setError("");
      })
      .catch((err) => {
        setRows([]);
        setTotalRows(0);
        setError(
          err instanceof Error ? err.message : "Failed to load employees"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columnDefs = useMemo<ColDef<EmployeeMasterRow>[]>(
    () =>
      withStatusSetFilter([
        { field: "emp_code", headerName: "Code", minWidth: 120 },
        {
          field: "employee_name",
          headerName: "Name",
          minWidth: 180,
          flex: 1,
        },
        { field: "mobile", headerName: "Mobile", minWidth: 130 },
        { field: "email", headerName: "Email", minWidth: 180 },
        {
          field: "project_name",
          headerName: "Project",
          minWidth: 160,
          valueFormatter: (p: ValueFormatterParams<EmployeeMasterRow>) => {
            const row = p.data;
            if (row?.project_name) return row.project_name;
            if (row?.project_id != null) return `Project #${row.project_id}`;
            return "—";
          },
        },
        {
          field: "project_role_name",
          headerName: "Project Role",
          minWidth: 180,
          valueFormatter: (p: ValueFormatterParams<EmployeeMasterRow>) => {
            const row = p.data;
            const name = row?.project_role_name ?? row?.emp_role_name;
            const code = row?.project_role_code ?? row?.emp_role_code;
            if (name) {
              return code ? `${name} (${code})` : name;
            }
            const roleId = row?.project_role_id ?? row?.emp_role;
            return roleId != null ? `Role #${roleId}` : "—";
          },
        },
        { field: "status", headerName: "Status", minWidth: 110 },
        { field: "created_at", headerName: "Created", minWidth: 160 },
      ]),
    []
  );

  const rowActions = useMemo<TableRowAction<EmployeeMasterRow>[]>(
    () => [
      viewRowAction((row) => router.push(`/employee-master/${row.id}`)),
      editRowAction((row) => router.push(`/employee-master/${row.id}/edit`)),
      deleteRowAction(async (row) => {
        await DeleteEmployee(row.id);
        load();
      }),
    ],
    [load, router]
  );

  return (
    <PageShell
      title="Employee Master"
      description="Employees with project role and portal login credentials"
    >
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="mb-4 flex justify-end">
        <Button
          render={<Link href="/employee-master/create" />}
          className="h-10 gap-2"
        >
          <Plus className="size-4" />
          Create Employee
        </Button>
      </div>
      <DynamicTable<EmployeeMasterRow>
        rowData={rows}
        columnDefs={columnDefs}
        rowActions={rowActions}
        loading={loading}
        totalRowCount={totalRows}
        dateFields={["created_at", "updated_at"]}
        emptyMessage="No employees found"
        height="560px"
      />
    </PageShell>
  );
}
