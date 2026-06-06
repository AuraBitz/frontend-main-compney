import type { DynamicFormConfig, DynamicSelectOption } from "@/types/dynamic-form.types";
import type { ProjectRoleMasterRow } from "@/types/project-role-master.types";

const STATUS_OPTIONS: DynamicSelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export function getEmptyProjectRoleFormData(): Record<string, unknown> {
  return {
    code: "",
    role_name: "",
    description: "",
    status: "active",
  };
}

export function mapProjectRoleToFormData(
  row: ProjectRoleMasterRow
): Record<string, unknown> {
  return {
    code: row.code ?? "",
    role_name: row.role_name ?? "",
    description: row.description ?? "",
    status: row.status ?? "active",
  };
}

export function mapFormToProjectRolePayload(data: Record<string, unknown>) {
  return {
    code: String(data.code ?? "").trim(),
    role_name: String(data.role_name ?? "").trim(),
    description: String(data.description ?? "").trim() || null,
    status: String(data.status ?? "active").toLowerCase(),
  };
}

function projectRoleFields(readOnly: boolean) {
  return [
    {
      name: "code",
      label: "Code",
      type: "text" as const,
      required: true,
      placeholder: "e.g. store_manager",
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

export function buildProjectRoleFormConfig(
  mode: "create" | "edit" | "view",
  initialData: Record<string, unknown>
): DynamicFormConfig {
  const readOnly = mode === "view";
  const fields = projectRoleFields(readOnly).map((field) => {
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
        ? "View Project Role"
        : mode === "edit"
          ? "Edit Project Role"
          : "Create Project Role",
    subtitle:
      mode === "view"
        ? "Project role details (read-only)."
        : mode === "edit"
          ? "Update project role used for portal access."
          : "Add a role for project permission and user login mapping.",
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
