import type { DynamicFormConfig, DynamicSelectOption } from "@/types/dynamic-form.types";
import type { BackendLoginAccount } from "@/services/api/login.api";
import { projectRoleListApiObject } from "@/lib/form-api-objects";

const STATUS_OPTIONS: DynamicSelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export interface ClientLoginFormOptions {
  roleOptions?: DynamicSelectOption[];
}

export function mapClientLoginToFormData(
  row: BackendLoginAccount
): Record<string, unknown> {
  return {
    username: row.username ?? "",
    email: row.email ?? "",
    role: row.role ?? "client",
    project_role_id: row.project_role_id ? String(row.project_role_id) : "",
    _project_role_label: "",
    status: row.status ?? "active",
  };
}

export function enrichClientLoginFormData(
  data: Record<string, unknown>,
  options: ClientLoginFormOptions = {}
): Record<string, unknown> {
  const next = { ...data };
  const roleId = String(next.project_role_id ?? "");
  if (!String(next._project_role_label ?? "").trim() && roleId && options.roleOptions?.length) {
    next._project_role_label =
      options.roleOptions.find((o) => o.value === roleId)?.label ?? roleId;
  }
  return next;
}

export function mapFormToClientLoginPayload(data: Record<string, unknown>) {
  const projectRoleRaw = String(data.project_role_id ?? "").trim();
  const projectRoleId = projectRoleRaw ? Number(projectRoleRaw) : null;

  return {
    username: String(data.username ?? "").trim(),
    email: String(data.email ?? "").trim(),
    role: String(data.role ?? "client").trim() || "client",
    project_role_id:
      projectRoleId != null && Number.isFinite(projectRoleId)
        ? projectRoleId
        : null,
    status: String(data.status ?? "active").toLowerCase(),
  };
}

export function buildClientLoginFormConfig(
  mode: "edit" | "view",
  initialData: Record<string, unknown>
): DynamicFormConfig {
  const readOnly = mode === "view";

  return {
    title: mode === "view" ? "View Login Account" : "Edit Login Account",
    subtitle:
      "Assign a Project Role so login opens the correct portal access.",
    mode,
    stickyFooter: true,
    submitLabel: "Update Account",
    cancelLabel: "Back",
    initialData,
    sections: [
      {
        title: "Account",
        gridCols: "grid-cols-1 md:grid-cols-2",
        fields: [
          {
            name: "username",
            label: "Username",
            type: "text",
            required: true,
            readOnly,
          },
          {
            name: "email",
            label: "Email",
            type: "email",
            required: true,
            readOnly,
          },
          {
            name: "role",
            label: "System Role",
            type: "text",
            readOnly: true,
          },
          {
            name: "project_role_id",
            label: "Project Role",
            type: "input-sidebar",
            fullWidth: true,
            placeholder: "Select project role for portal access",
            apiObject: projectRoleListApiObject,
            selectedData: "project_role_id",
            rowValueKey: "id",
            displayedData: "role_name",
            displayFields: ["code", "role_name", "status"],
            customColumnDefs: [
              { key: "code", label: "Code" },
              { key: "role_name", label: "Role Name" },
              { key: "status", label: "Status" },
            ],
            cacheFieldName: "_project_role_label",
            readOnly,
            viewDisplayResolver: (fd) =>
              String(fd._project_role_label ?? fd.project_role_id ?? "—"),
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: STATUS_OPTIONS,
            readOnly,
          },
        ],
      },
    ],
  };
}
