"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DynamicTable,
  deleteRowAction,
  editRowAction,
  type TableRowAction,
} from "@/components/dynamicTable";
import {
  buildEmployeeFormConfig,
  enrichEmployeeFormData,
  getEmptyEmployeeFormData,
  mapEmployeeToFormData,
  mapFormToEmployeePayload,
} from "@/lib/employee-form-config";
import { DynamicForm } from "@/components/form/dynamic-form";
import { withStatusSetFilter } from "@/lib/table-column-utils";
import { listQueryForProjectEmployees } from "@/restaurant-management-admin-panel/lib/project-filters";
import {
  portalEmployeeMasterCreatePath,
  portalEmployeeMasterEditPath,
  portalEmployeeMasterPath,
} from "@/restaurant-management-admin-panel/lib/portal-routes";
import {
  CreateEmployee,
  DeleteEmployee,
  GetAllEmployeesList,
  GetEmployeeById,
  UpdateEmployee,
} from "@/services/api/employee-master.api";
import { GetRolesByProjectId } from "@/services/api/roles.api";
import type { EmployeeMasterRow } from "@/types/employee-master.types";

interface ProjectEmployeeMasterListProps {
  projectId: number;
  projectName: string;
  createHref?: string;
  editHref?: (employeeId: number) => string;
  /** Hide breadcrumb + create button when parent already renders them */
  embedded?: boolean;
}

export function ProjectEmployeeMasterList({
  projectId,
  projectName,
  createHref,
  editHref,
  embedded = false,
}: ProjectEmployeeMasterListProps) {
  const router = useRouter();
  const [rows, setRows] = useState<EmployeeMasterRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    GetAllEmployeesList(listQueryForProjectEmployees(projectId))
      .then((result) => {
        setRows(result.rows);
        setTotal(result.total);
      })
      .catch(() => {
        setRows([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const columnDefs = useMemo<ColDef<EmployeeMasterRow>[]>(
    () =>
      withStatusSetFilter([
        { field: "emp_code", headerName: "Code", minWidth: 110 },
        {
          field: "employee_name",
          headerName: "Name",
          minWidth: 160,
          flex: 1,
        },
        { field: "mobile", headerName: "Mobile", minWidth: 120 },
        { field: "email", headerName: "Email", minWidth: 180 },
        {
          field: "project_role_name",
          headerName: "Project Role",
          minWidth: 170,
          valueFormatter: (p: ValueFormatterParams<EmployeeMasterRow>) => {
            const row = p.data;
            const name = row?.project_role_name ?? row?.emp_role_name;
            const code = row?.project_role_code ?? row?.emp_role_code;
            if (name) {
              return code ? `${name} (${code})` : name;
            }
            return "—";
          },
        },
        { field: "status", headerName: "Status", minWidth: 100 },
      ]),
    []
  );

  const resolveEditPath = useCallback(
    (employeeId: number) =>
      editHref?.(employeeId) ??
      portalEmployeeMasterEditPath(projectId, employeeId),
    [editHref, projectId]
  );

  const rowActions = useMemo<TableRowAction<EmployeeMasterRow>[]>(
    () => [
      editRowAction((row) => router.push(resolveEditPath(row.id))),
      deleteRowAction(async (row) => {
        await DeleteEmployee(row.id);
        load();
      }),
    ],
    [load, resolveEditPath, router]
  );

  const createPath =
    createHref ?? portalEmployeeMasterCreatePath(projectId);

  const table = (
    <DynamicTable<EmployeeMasterRow>
        rowData={rows}
        columnDefs={columnDefs}
        rowActions={rowActions}
        loading={loading}
        totalRowCount={total}
        emptyMessage={`No employees assigned to ${projectName}`}
        height="520px"
      />
  );

  if (embedded) {
    return table;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {projectName} — employees assigned to this project
        </p>
        <Button render={<Link href={createPath} />} className="h-10 gap-2">
          <Plus className="size-4" />
          Create Employee
        </Button>
      </div>
      {table}
    </div>
  );
}

interface ProjectEmployeeMasterCreateProps {
  projectId: number;
  projectName: string;
  onDone?: () => void;
  onCancel?: () => void;
}

export function ProjectEmployeeMasterCreate({
  projectId,
  projectName,
  onDone,
  onCancel,
}: ProjectEmployeeMasterCreateProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    GetRolesByProjectId(projectId)
      .then((result) => {
        const count = result.rows?.length ?? 0;
        if (!count) {
          setError(
            "No roles linked to this project. Add roles in Role Master with this project first."
          );
        } else {
          setError("");
        }
      })
      .catch(() => {
        setError("Failed to load roles for this project.");
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  const config = useMemo(
    () =>
      buildEmployeeFormConfig("create", getEmptyEmployeeFormData(), {
        scopeProjectId: projectId,
      }),
    [projectId]
  );

  const handleDone = onDone ?? (() => router.push(portalEmployeeMasterPath(projectId)));
  const handleCancel =
    onCancel ?? (() => router.push(portalEmployeeMasterPath(projectId)));

  if (loading) {
    return <Loader2 className="size-5 animate-spin text-muted-foreground" />;
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <DynamicForm
        config={config}
        onSubmit={async (data) => {
          if (!String(data.password ?? "").trim()) {
            throw new Error("Login password is required.");
          }
          if (!String(data.role_master_id ?? "").trim()) {
            throw new Error("Project Role is required.");
          }
          await CreateEmployee(
            mapFormToEmployeePayload(data, { scopeProjectId: projectId })
          );
          handleDone();
        }}
        onCancel={handleCancel}
      />
      <p className="text-xs text-muted-foreground">
        Creating employee for {projectName}. Only Role Master entries linked to
        this project are available.
      </p>
    </div>
  );
}

interface ProjectEmployeeMasterEditProps {
  projectId: number;
  employeeId: string | number;
  onDone?: () => void;
  onCancel?: () => void;
}

export function ProjectEmployeeMasterEdit({
  projectId,
  employeeId,
  onDone,
  onCancel,
}: ProjectEmployeeMasterEditProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      GetEmployeeById(employeeId),
      GetRolesByProjectId(projectId),
    ])
      .then(([employee, roles]) => {
        const projectIds = (employee.project_ids ?? [])
          .map(Number)
          .filter(Number.isFinite);
        if (!projectIds.includes(projectId)) {
          throw new Error("Employee does not belong to this project.");
        }
        const allowedRoleIds = new Set(
          (roles.rows ?? []).map((role) => Number(role.id))
        );
        const roleMasterId =
          employee.role_master_id ?? employee.project_role_id ?? null;
        if (
          roleMasterId == null ||
          !allowedRoleIds.has(Number(roleMasterId))
        ) {
          throw new Error(
            "Employee project role is not linked to this project in Role Master."
          );
        }
        setInitialData(
          enrichEmployeeFormData(mapEmployeeToFormData(employee), {
            scopeProjectId: projectId,
          })
        );
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load employee")
      )
      .finally(() => setLoading(false));
  }, [employeeId, projectId]);

  const config = useMemo(
    () =>
      initialData
        ? buildEmployeeFormConfig("edit", initialData, {
            scopeProjectId: projectId,
          })
        : null,
    [initialData, projectId]
  );

  const listPath = portalEmployeeMasterPath(projectId);
  const handleDone = onDone ?? (() => router.push(listPath));
  const handleCancel = onCancel ?? (() => router.push(listPath));

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (!config) {
    return (
      <p className="text-sm text-muted-foreground">
        {loading ? "Loading employee..." : "Employee not found."}
      </p>
    );
  }

  return (
    <DynamicForm
      config={config}
      loading={loading}
      onSubmit={async (data) => {
        await UpdateEmployee(
          employeeId,
          mapFormToEmployeePayload(data, { scopeProjectId: projectId })
        );
        handleDone();
      }}
      onCancel={handleCancel}
    />
  );
}
