import type { DynamicFormConfig, DynamicSelectOption } from "@/types/dynamic-form.types";
import type { RoleMasterRow } from "@/services/api/roles.api";
import { projectListApiObject } from "@/lib/form-api-objects";

const STATUS_OPTIONS: DynamicSelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export interface RoleFormOptions {
  projectOptions?: DynamicSelectOption[];
}

export function getEmptyRoleFormData(): Record<string, unknown> {
  return {
    role_code: "",
    role_name: "",
    description: "",
    project_ids: [] as string[],
    _projects_label: "",
    status: "active",
  };
}

export function mapRoleToFormData(row: RoleMasterRow): Record<string, unknown> {
  const projectIds = Array.isArray(row.project_ids)
    ? row.project_ids.map(String)
    : [];
  return {
    role_code: row.role_code ?? "",
    role_name: row.role_name ?? "",
    description: row.description ?? "",
    project_ids: projectIds,
    _projects_label: "",
    status: row.status ?? "active",
  };
}

export function enrichRoleFormData(
  data: Record<string, unknown>,
  options: RoleFormOptions = {}
): Record<string, unknown> {
  const next = { ...data };
  const ids = Array.isArray(next.project_ids)
    ? (next.project_ids as string[])
    : [];
  if (!String(next._projects_label ?? "").trim() && options.projectOptions?.length) {
    const labels = ids
      .map(
        (id) =>
          options.projectOptions?.find((o) => o.value === id)?.label ?? id
      )
      .filter(Boolean);
    next._projects_label = labels.join(", ");
  }
  return next;
}

export function mapFormToRolePayload(data: Record<string, unknown>) {
  const projects = Array.isArray(data.project_ids)
    ? (data.project_ids as string[])
        .map((id) => Number(id))
        .filter((n) => Number.isFinite(n))
    : [];

  return {
    role_code: String(data.role_code ?? "").trim(),
    role_name: String(data.role_name ?? "").trim(),
    description: String(data.description ?? "").trim() || null,
    project_ids: projects,
    status: String(data.status ?? "active").toLowerCase(),
  };
}

function roleFields(readOnly: boolean) {
  return [
    {
      name: "role_code",
      label: "Role Code",
      type: "text" as const,
      required: true,
      placeholder: "e.g. manager",
      readOnly,
    },
    {
      name: "role_name",
      label: "Role Name",
      type: "text" as const,
      required: true,
      placeholder: "e.g. Store Manager",
      readOnly,
    },
    {
      name: "project_ids",
      label: "Select Projects",
      type: "input-sidebar" as const,
      required: true,
      fullWidth: true,
      placeholder: "Click to choose projects",
      apiObject: projectListApiObject,
      selectedData: "project_ids",
      rowValueKey: "id",
      displayedData: "name",
      multiSelect: true,
      displayFields: ["name", "status"],
      customColumnDefs: [
        { key: "name", label: "Project Name" },
        { key: "status", label: "Status" },
      ],
      cacheFieldName: "_projects_label",
      readOnly,
    },
    {
      name: "status",
      label: "Status",
      type: "select" as const,
      required: true,
      options: STATUS_OPTIONS,
      readOnly,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea" as const,
      rows: 3,
      fullWidth: true,
      placeholder: "Optional",
      readOnly,
    },
  ];
}

export function buildRoleFormConfig(
  mode: "create" | "edit" | "view",
  initialData: Record<string, unknown>,
  formOptions: RoleFormOptions = {}
): DynamicFormConfig {
  const readOnly = mode === "view";
  const fields = roleFields(readOnly).map((field) => {
    if (field.name === "project_ids") {
      return {
        ...field,
        viewDisplayResolver: (fd: Record<string, unknown>) =>
          String(fd._projects_label ?? ""),
      };
    }
    if (field.name === "status") {
      return {
        ...field,
        viewDisplayResolver: (fd: Record<string, unknown>) => {
          const v = String(fd.status ?? "").toLowerCase();
          return v === "active" ? "Active" : v === "inactive" ? "Inactive" : v;
        },
      };
    }
    return field;
  });

  return {
    title:
      mode === "view"
        ? "View Role"
        : mode === "edit"
          ? "Edit Role"
          : "Create Role",
    subtitle:
      mode === "view"
        ? "Role details (read-only)."
        : mode === "edit"
          ? "Update role and linked projects."
          : "Add a new role with project access.",
    mode,
    stickyFooter: true,
    submitLabel: mode === "edit" ? "Update Role" : "Create Role",
    cancelLabel: "Back",
    initialData,
    sections: [
      {
        title: "Role Details",
        gridCols: "grid-cols-1 md:grid-cols-2",
        fields,
      },
    ],
  };
}
