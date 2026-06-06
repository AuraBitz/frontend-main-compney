import type { DynamicFormConfig, DynamicSelectOption } from "@/types/dynamic-form.types";
import type { ProjectPermissionMasterRow } from "@/types/project-permission-master.types";
import {
  projectListApiObject,
  projectRoleListApiObject,
} from "@/lib/form-api-objects";

export interface ProjectPermissionFormOptions {
  projectOptions?: DynamicSelectOption[];
  roleOptions?: DynamicSelectOption[];
  usedRoleIds?: number[];
}

export function getEmptyProjectPermissionFormData(): Record<string, unknown> {
  return {
    role_ids: [] as string[],
    _roles_label: "",
    overall_access: false,
    project_ids: [] as string[],
    _projects_label: "",
  };
}

export function mapProjectPermissionToFormData(
  row: ProjectPermissionMasterRow
): Record<string, unknown> {
  const roleIds = Array.isArray(row.role_ids) ? row.role_ids.map(String) : [];
  const projectIds = Array.isArray(row.project_ids)
    ? row.project_ids.map(String)
    : [];

  return {
    role_ids: roleIds,
    _roles_label: row.role_names ?? "",
    overall_access: Boolean(row.overall_access),
    project_ids: projectIds,
    _projects_label: "",
  };
}

export function enrichProjectPermissionFormData(
  data: Record<string, unknown>,
  options: ProjectPermissionFormOptions = {}
): Record<string, unknown> {
  const next = { ...data };

  const roleIds = Array.isArray(next.role_ids)
    ? (next.role_ids as string[])
    : [];
  if (!String(next._roles_label ?? "").trim() && options.roleOptions?.length) {
    const labels = roleIds
      .map(
        (id) =>
          options.roleOptions?.find((o) => o.value === id)?.label ?? id
      )
      .filter(Boolean);
    next._roles_label = labels.join(", ");
  }

  const projectIds = Array.isArray(next.project_ids)
    ? (next.project_ids as string[])
    : [];
  if (!String(next._projects_label ?? "").trim() && options.projectOptions?.length) {
    const labels = projectIds
      .map(
        (id) =>
          options.projectOptions?.find((o) => o.value === id)?.label ?? id
      )
      .filter(Boolean);
    next._projects_label = labels.join(", ");
  }

  return next;
}

export function mapFormToProjectPermissionPayload(data: Record<string, unknown>) {
  const overallAccess = Boolean(data.overall_access);
  const roles = Array.isArray(data.role_ids)
    ? (data.role_ids as string[])
        .map((id) => Number(id))
        .filter((n) => Number.isFinite(n))
    : [];
  const projects = Array.isArray(data.project_ids)
    ? (data.project_ids as string[])
        .map((id) => Number(id))
        .filter((n) => Number.isFinite(n))
    : [];

  return {
    role_ids: roles,
    overall_access: overallAccess,
    project_ids: overallAccess ? [] : projects,
  };
}

function projectPermissionFields(
  mode: "create" | "edit" | "view",
  options: ProjectPermissionFormOptions
) {
  const readOnly = mode === "view";
  const usedRoleIds = new Set(options.usedRoleIds ?? []);

  return [
    {
      name: "role_ids",
      label: "Project Roles",
      type: "input-sidebar" as const,
      required: true,
      fullWidth: true,
      placeholder: "Select from Project Role Master",
      apiObject: projectRoleListApiObject,
      selectedData: "role_ids",
      rowValueKey: "id",
      displayedData: "role_name",
      multiSelect: true,
      displayFields: ["code", "role_name", "status"],
      customColumnDefs: [
        { key: "code", label: "Code" },
        { key: "role_name", label: "Role Name" },
        { key: "status", label: "Status" },
      ],
      cacheFieldName: "_roles_label",
      readOnly,
      viewDisplayResolver: (fd: Record<string, unknown>) =>
        String(fd._roles_label ?? "—"),
      validate: (value: unknown) => {
        const ids = Array.isArray(value) ? value : [];
        if (!ids.length) return "Select at least one role";
        if (mode === "create") {
          const conflict = ids
            .map((id) => Number(id))
            .find((id) => usedRoleIds.has(id));
          if (conflict) {
            return "One or more roles already used in another permission row";
          }
        }
        return true;
      },
    },
    {
      name: "overall_access",
      label: "Overall Access (Management Portal)",
      type: "checkbox" as const,
      fullWidth: true,
      readOnly,
      viewDisplayResolver: (fd: Record<string, unknown>) =>
        fd.overall_access ? "Yes — full management portal" : "No — project portal only",
    },
    {
      name: "project_ids",
      label: "Allowed Projects",
      type: "input-sidebar" as const,
      required: true,
      fullWidth: true,
      placeholder: "Select projects for portal access",
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
      condition: (fd: Record<string, unknown>) => !fd.overall_access,
      viewDisplayResolver: (fd: Record<string, unknown>) =>
        fd.overall_access
          ? "All via management portal"
          : String(fd._projects_label ?? "—"),
      validate: (value: unknown, fd: Record<string, unknown>) => {
        if (fd.overall_access) return true;
        const ids = Array.isArray(value) ? value : [];
        if (!ids.length) {
          return "Select at least one project when overall access is off";
        }
        return true;
      },
    },
  ];
}

export function buildProjectPermissionFormConfig(
  mode: "create" | "edit" | "view",
  initialData: Record<string, unknown>,
  formOptions: ProjectPermissionFormOptions = {}
): DynamicFormConfig {
  return {
    title:
      mode === "view"
        ? "View Project Permission"
        : mode === "edit"
          ? "Edit Project Permission"
          : "Create Project Permission",
    subtitle:
      mode === "view"
        ? "Role-based portal access (read-only)."
        : mode === "edit"
          ? "Update roles, overall access, or allowed projects."
          : "Assign management or project portal access to project roles.",
    mode,
    stickyFooter: true,
    submitLabel: mode === "edit" ? "Update Permission" : "Create Permission",
    cancelLabel: "Back",
    initialData,
    sections: [
      {
        title: "Access Rules",
        gridCols: "grid-cols-1",
        fields: projectPermissionFields(mode, formOptions),
      },
    ],
  };
}
