import type {
  DynamicFormConfig,
  DynamicFormField,
  DynamicSelectOption,
} from "@/types/dynamic-form.types";
import type { ListApiObject } from "@/types/list-api.types";
import type { EmployeeMasterRow } from "@/types/employee-master.types";
import {
  createRoleListByProjectApiObject,
  projectRoleListApiObject,
} from "@/lib/form-api-objects";

const STATUS_OPTIONS: DynamicSelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export interface EmployeeFormOptions {
  roleOptions?: DynamicSelectOption[];
  /** Portal: Role Master picker filtered by project; emp_role shown read-only */
  scopeProjectId?: number;
}

export function getEmptyEmployeeFormData(): Record<string, unknown> {
  return {
    emp_code: "",
    employee_name: "",
    mobile: "",
    email: "",
    address: "",
    emp_role: "",
    _emp_role_label: "",
    role_master_id: "",
    _role_master_label: "",
    status: "active",
    password: "",
  };
}

export function mapEmployeeToFormData(
  row: EmployeeMasterRow
): Record<string, unknown> {
  const empRoleLabel =
    row.emp_role_name && row.emp_role_code
      ? `${row.emp_role_name} (${row.emp_role_code})`
      : row.emp_role_name ?? "";

  const projectRoleLabel =
    row.project_role_name && row.project_role_code
      ? `${row.project_role_name} (${row.project_role_code})`
      : row.project_role_name ?? "";

  return {
    emp_code: row.emp_code ?? "",
    employee_name: row.employee_name ?? "",
    mobile: row.mobile ?? "",
    email: row.email ?? "",
    address: row.address ?? "",
    emp_role: row.emp_role != null ? String(row.emp_role) : "",
    _emp_role_label: empRoleLabel,
    role_master_id:
      row.role_master_id != null
        ? String(row.role_master_id)
        : row.project_role_id != null
          ? String(row.project_role_id)
          : "",
    _role_master_label: projectRoleLabel,
    status: row.status ?? "active",
    password: "",
  };
}

export function enrichEmployeeFormData(
  data: Record<string, unknown>,
  options: EmployeeFormOptions = {}
): Record<string, unknown> {
  const next = { ...data };
  const empRoleId = String(next.emp_role ?? "");
  if (
    !String(next._emp_role_label ?? "").trim() &&
    empRoleId &&
    options.roleOptions?.length
  ) {
    next._emp_role_label =
      options.roleOptions.find((o) => o.value === empRoleId)?.label ?? empRoleId;
  }
  return next;
}

export function mapFormToEmployeePayload(
  data: Record<string, unknown>,
  options: { scopeProjectId?: number } = {}
) {
  const password = String(data.password ?? "").trim();

  const payload: Record<string, unknown> = {
    emp_code: String(data.emp_code ?? "").trim(),
    employee_name: String(data.employee_name ?? "").trim(),
    mobile: String(data.mobile ?? "").trim() || null,
    email: String(data.email ?? "").trim() || null,
    address: String(data.address ?? "").trim() || null,
    status: String(data.status ?? "active").toLowerCase(),
  };

  if (password) payload.password = password;

  if (options.scopeProjectId != null) {
    payload.scope_project_id = options.scopeProjectId;
    const roleMasterId = Number(data.role_master_id);
    if (Number.isFinite(roleMasterId) && roleMasterId > 0) {
      payload.role_master_id = roleMasterId;
    }
  } else {
    const empRole = Number(data.emp_role);
    if (Number.isFinite(empRole) && empRole > 0) {
      payload.emp_role = empRole;
    }
    const roleMasterId = Number(data.role_master_id);
    if (Number.isFinite(roleMasterId) && roleMasterId > 0) {
      payload.role_master_id = roleMasterId;
    }
  }

  return payload;
}

function roleMasterSidebarField(
  apiObject: ListApiObject,
  readOnly: boolean,
  placeholder: string
) {
  return {
    name: "role_master_id",
    label: "Project Role",
    type: "input-sidebar" as const,
    required: true,
    fullWidth: true,
    placeholder,
    apiObject,
    selectedData: "role_master_id",
    rowValueKey: "id",
    displayedData: "role_name",
    displayFields: ["role_code", "role_name", "status"],
    customColumnDefs: [
      { key: "role_code", label: "Code" },
      { key: "role_name", label: "Role Name" },
      { key: "status", label: "Status" },
    ],
    cacheFieldName: "_role_master_label",
    readOnly,
    viewDisplayResolver: (fd: Record<string, unknown>) =>
      String(fd._role_master_label ?? fd.role_master_id ?? "—"),
  };
}

function employeeDetailFields(
  mode: "create" | "edit" | "view",
  options: EmployeeFormOptions = {}
) {
  const readOnly = mode === "view";
  const scopedProjectId = options.scopeProjectId;
  const hasScopedProject =
    scopedProjectId != null && Number.isFinite(Number(scopedProjectId));

  const empRoleViewDisplay = (fd: Record<string, unknown>) =>
    String(fd._emp_role_label ?? fd.emp_role ?? "—");

  const empRoleField = hasScopedProject
    ? mode === "create"
      ? null
      : {
          name: "_emp_role_label",
          label: "Emp Role",
          type: "text" as const,
          readOnly: true,
          fullWidth: true,
          viewDisplayResolver: empRoleViewDisplay,
        }
    : options.roleOptions && options.roleOptions.length > 0
      ? {
          name: "emp_role",
          label: "Emp Role",
          type: "select" as const,
          required: true,
          fullWidth: true,
          placeholder: "Select project role (login & redirect)",
          options: options.roleOptions,
          readOnly,
          viewDisplayResolver: empRoleViewDisplay,
        }
      : {
          name: "emp_role",
          label: "Emp Role",
          type: "input-sidebar" as const,
          required: true,
          fullWidth: true,
          placeholder: "Select from Project Role Master",
          apiObject: projectRoleListApiObject,
          selectedData: "emp_role",
          rowValueKey: "id",
          displayedData: "role_name",
          displayFields: ["code", "role_name", "status"],
          customColumnDefs: [
            { key: "code", label: "Code" },
            { key: "role_name", label: "Role Name" },
            { key: "status", label: "Status" },
          ],
          cacheFieldName: "_emp_role_label",
          readOnly,
          viewDisplayResolver: empRoleViewDisplay,
        };

  const projectRoleField = hasScopedProject
    ? roleMasterSidebarField(
        createRoleListByProjectApiObject(Number(scopedProjectId)),
        readOnly,
        "Select role from Role Master for this project"
      )
    : null;

  const fields: DynamicFormField[] = [
    {
      name: "emp_code",
      label: "Employee Code",
      type: "text" as const,
      required: true,
      placeholder: "e.g. EMP001 — used for portal login",
      readOnly,
    },
    {
      name: "employee_name",
      label: "Employee Name",
      type: "text" as const,
      required: true,
      readOnly,
    },
    {
      name: "mobile",
      label: "Mobile",
      type: "tel" as const,
      readOnly,
    },
    {
      name: "email",
      label: "Email",
      type: "email" as const,
      placeholder: "Also used for portal login",
      readOnly,
    },
    ...(empRoleField ? [empRoleField] : []),
  ];

  if (projectRoleField) {
    fields.push(projectRoleField);
  }

  fields.push(
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      fullWidth: true,
      options: STATUS_OPTIONS,
      readOnly,
    },
    {
      name: "address",
      label: "Address",
      type: "textarea",
      rows: 3,
      fullWidth: true,
      readOnly,
    }
  );

  return fields;
}

function passwordFields(mode: "create" | "edit" | "view") {
  const readOnly = mode === "view";
  const isCreate = mode === "create";

  if (readOnly) return [];

  return [
    {
      name: "password",
      label: isCreate ? "Portal Password" : "New Portal Password",
      type: "password" as const,
      required: isCreate,
      fullWidth: true,
      placeholder: isCreate
        ? "Min 6 characters — login with employee code or email"
        : "Leave blank to keep current password",
    },
  ];
}

export function buildEmployeeFormConfig(
  mode: "create" | "edit" | "view",
  initialData: Record<string, unknown>,
  options: EmployeeFormOptions = {}
): DynamicFormConfig {
  const detailFields = employeeDetailFields(mode, options).map((field) => {
    if (field.name === "status") {
      return {
        ...field,
        viewDisplayResolver: (fd: Record<string, unknown>) => {
          const v = String(fd.status ?? "").toLowerCase();
          return v === "active" ? "Active" : v === "inactive" ? "Inactive" : v;
        },
      };
    }
    if (field.name === "emp_role" && field.type === "text") {
      return {
        ...field,
        viewDisplayResolver: (fd: Record<string, unknown>) =>
          String(fd._emp_role_label ?? fd.emp_role ?? "—"),
      };
    }
    return field;
  });

  const sections: DynamicFormConfig["sections"] = [
    {
      title: "Employee Details",
      gridCols: "grid-cols-1 md:grid-cols-2",
      fields: detailFields,
    },
  ];

  const loginFields = passwordFields(mode);
  if (loginFields.length) {
    sections.push({
      title: "Portal Login",
      gridCols: "grid-cols-1",
      fields: loginFields,
    });
  }

  return {
    title:
      mode === "view"
        ? "View Employee"
        : mode === "edit"
          ? "Edit Employee"
          : "Create Employee",
    subtitle:
      options.scopeProjectId != null
        ? "Emp Role controls login redirect; Project Role is from Role Master for this project."
        : "Login with employee code or email — Emp Role uses Project Permission Master for redirect.",
    mode,
    stickyFooter: true,
    submitLabel: mode === "edit" ? "Update Employee" : "Create Employee",
    cancelLabel: "Back",
    initialData,
    sections,
  };
}
