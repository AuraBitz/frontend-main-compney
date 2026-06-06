import type { DynamicFormConfig, DynamicSelectOption } from "@/types/dynamic-form.types";
import { projectListApiObject } from "@/lib/form-api-objects";

export interface ParentModuleRow {
  id: number;
  module_name: string;
  status: string;
  project_id?: number | null;
  project_name?: string | null;
  created_at?: string;
  created_by?: number | null;
  created_by_name?: string | null;
}

const STATUS_OPTIONS: DynamicSelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export function getEmptyParentModuleFormData(): Record<string, unknown> {
  return {
    module_name: "",
    project_id: "",
    _project_label: "",
    status: "active",
  };
}

export function mapParentModuleToFormData(row: ParentModuleRow): Record<string, unknown> {
  return {
    module_name: row.module_name ?? "",
    project_id: row.project_id != null ? String(row.project_id) : "",
    _project_label: row.project_name ?? "",
    status: row.status ?? "active",
  };
}

export function mapFormToParentModulePayload(data: Record<string, unknown>) {
  const projectRaw = String(data.project_id ?? "").trim();
  return {
    module_name: String(data.module_name ?? "").trim(),
    project_id: projectRaw ? Number(projectRaw) : null,
    status: String(data.status ?? "active").toLowerCase(),
  };
}

export function buildParentModuleFormConfig(
  mode: "create" | "edit" | "view",
  initialData: Record<string, unknown>
): DynamicFormConfig {
  const readOnly = mode === "view";
  const fields = [
    {
      name: "module_name",
      label: "Module Name",
      type: "text" as const,
      required: true,
      placeholder: "e.g. Billing",
      readOnly,
    },
    {
      name: "project_id",
      label: "Project",
      type: "input-sidebar" as const,
      required: !readOnly,
      placeholder: "Select project",
      apiObject: projectListApiObject,
      selectedData: "project_id",
      rowValueKey: "id",
      displayedData: "name",
      displayFields: ["name", "status"],
      customColumnDefs: [
        { key: "name", label: "Project Name" },
        { key: "status", label: "Status" },
      ],
      cacheFieldName: "_project_label",
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
  ].map((field) => {
    if (field.name === "project_id") {
      return {
        ...field,
        viewDisplayResolver: (fd: Record<string, unknown>) =>
          String(fd._project_label ?? ""),
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
        ? "View Parent Module"
        : mode === "edit"
          ? "Edit Parent Module"
          : "Create Parent Module",
    subtitle:
      mode === "view"
        ? "Parent module details (read-only)."
        : "Link module to a project — parent id is stored in project module_ids.",
    mode,
    stickyFooter: true,
    submitLabel: mode === "edit" ? "Update Module" : "Create Module",
    cancelLabel: "Back",
    initialData,
    sections: [
      {
        title: "Parent Module",
        gridCols: "grid-cols-1 md:grid-cols-2",
        fields,
      },
    ],
  };
}
