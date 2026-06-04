import type { DynamicFormConfig, DynamicSelectOption } from "@/types/dynamic-form.types";
import type { ProjectMasterRow } from "@/types/project-master.types";
import { parentModulesListApiObject } from "@/lib/form-api-objects";

const STATUS_OPTIONS: DynamicSelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export interface ProjectFormOptions {
  moduleOptions?: DynamicSelectOption[];
}

export function getEmptyProjectFormData(): Record<string, unknown> {
  return {
    name: "",
    description: "",
    project_start_at: "",
    status: "active",
    module_ids: [] as string[],
    _modules_label: "",
  };
}

export function mapProjectToFormData(row: ProjectMasterRow): Record<string, unknown> {
  const moduleIds = Array.isArray(row.module_ids)
    ? row.module_ids.map(String)
    : [];
  const start = row.project_start_at
    ? String(row.project_start_at).slice(0, 10)
    : "";
  return {
    name: row.name ?? "",
    description: row.description ?? "",
    project_start_at: start,
    status: row.status ?? "active",
    module_ids: moduleIds,
    _modules_label: "",
  };
}

export function enrichProjectFormData(
  data: Record<string, unknown>,
  options: ProjectFormOptions = {}
): Record<string, unknown> {
  const next = { ...data };
  const ids = Array.isArray(next.module_ids)
    ? (next.module_ids as string[])
    : [];
  if (!String(next._modules_label ?? "").trim() && options.moduleOptions?.length) {
    const labels = ids
      .map(
        (id) =>
          options.moduleOptions?.find((o) => o.value === id)?.label ?? id
      )
      .filter(Boolean);
    next._modules_label = labels.join(", ");
  }
  return next;
}

export function mapFormToProjectPayload(data: Record<string, unknown>) {
  const modules = Array.isArray(data.module_ids)
    ? (data.module_ids as string[])
        .map((id) => Number(id))
        .filter((n) => Number.isFinite(n))
    : [];

  const startRaw = String(data.project_start_at ?? "").trim();

  return {
    name: String(data.name ?? "").trim(),
    description: String(data.description ?? "").trim() || null,
    project_start_at: startRaw ? new Date(startRaw).toISOString() : null,
    status: String(data.status ?? "active").toLowerCase(),
    module_ids: modules,
    plan_ids: [],
  };
}

function projectFields(readOnly: boolean) {
  return [
    {
      name: "name",
      label: "Project Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter project name",
      readOnly,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea" as const,
      placeholder: "Optional description",
      rows: 3,
      fullWidth: true,
      readOnly,
    },
    {
      name: "project_start_at",
      label: "Project Start Date",
      type: "date" as const,
      required: true,
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
      name: "module_ids",
      label: "Select Modules",
      type: "input-sidebar" as const,
      required: true,
      fullWidth: true,
      placeholder: "Click to choose modules",
      apiObject: parentModulesListApiObject,
      selectedData: "module_ids",
      rowValueKey: "id",
      displayedData: "module_name",
      multiSelect: true,
      displayFields: ["module_name", "status"],
      customColumnDefs: [
        { key: "module_name", label: "Module Name" },
        { key: "status", label: "Status" },
      ],
      cacheFieldName: "_modules_label",
      readOnly,
    },
  ];
}

export function buildProjectFormConfig(
  mode: "create" | "edit" | "view",
  initialData: Record<string, unknown>,
  _formOptions: ProjectFormOptions = {}
): DynamicFormConfig {
  const readOnly = mode === "view";
  const fields = projectFields(readOnly).map((field) => {
    if (field.name === "module_ids") {
      return {
        ...field,
        viewDisplayResolver: (fd: Record<string, unknown>) =>
          String(fd._modules_label ?? ""),
      };
    }
    return field;
  });

  return {
    title:
      mode === "view"
        ? "View Project"
        : mode === "edit"
          ? "Edit Project"
          : "Create Project",
    subtitle:
      mode === "view"
        ? "Project details (read-only)."
        : mode === "edit"
          ? "Update project information."
          : "Add a new project.",
    mode,
    stickyFooter: true,
    submitLabel: mode === "edit" ? "Update Project" : "Create Project",
    cancelLabel: "Back",
    initialData,
    sections: [
      {
        title: "Project Details",
        gridCols: "grid-cols-1 md:grid-cols-2",
        fields,
      },
    ],
  };
}
