import type { DynamicFormConfig } from "@/types/dynamic-form.types";
import type { ChildModuleRow } from "@/services/api/child-modules.api";
import { parentModulesListApiObject } from "@/lib/form-api-objects";

export function getEmptyChildModuleFormData(): Record<string, unknown> {
  return {
    parent_module_id: "",
    child_module_name: "",
    _parent_label: "",
  };
}

export function mapChildModuleToFormData(row: ChildModuleRow): Record<string, unknown> {
  return {
    parent_module_id:
      row.parent_module_id != null ? String(row.parent_module_id) : "",
    child_module_name: row.child_module_name ?? "",
    _parent_label: row.parent_module_name ?? "",
  };
}

export function mapFormToChildModulePayload(data: Record<string, unknown>) {
  return {
    parent_module_id: Number(data.parent_module_id),
    child_module_name: String(data.child_module_name ?? "").trim(),
  };
}

export function buildChildModuleFormConfig(
  mode: "create" | "edit" | "view",
  initialData: Record<string, unknown>
): DynamicFormConfig {
  const readOnly = mode === "view";
  const fields = [
    {
      name: "parent_module_id",
      label: "Parent Module",
      type: "api-select" as const,
      required: true,
      placeholder: "Select parent module",
      apiObject: parentModulesListApiObject,
      selectedDataKey: { label: "module_name", val: "id" },
      displayedData: "module_name",
      cacheFieldName: "_parent_label",
      readOnly,
    },
    {
      name: "child_module_name",
      label: "Child Module Name",
      type: "text" as const,
      required: true,
      placeholder: "e.g. Invoices",
      readOnly,
    },
  ].map((field) => {
    if (field.name === "parent_module_id") {
      return {
        ...field,
        viewDisplayResolver: (fd: Record<string, unknown>) =>
          String(fd._parent_label ?? ""),
      };
    }
    return field;
  });

  return {
    title:
      mode === "view"
        ? "View Child Module"
        : mode === "edit"
          ? "Edit Child Module"
          : "Create Child Module",
    subtitle:
      mode === "view"
        ? "Child module details (read-only)."
        : "Add a child module under a parent module.",
    mode,
    stickyFooter: true,
    submitLabel: mode === "edit" ? "Update Child Module" : "Create Child Module",
    cancelLabel: "Back",
    initialData,
    sections: [
      {
        title: "Child Module",
        gridCols: "grid-cols-1 md:grid-cols-2",
        fields,
      },
    ],
  };
}
