import type { DynamicFormConfig, DynamicSelectOption } from "@/types/dynamic-form.types";
import type { PlanMasterRow } from "@/services/api/plans.api";
import {
  parentModulesListApiObject,
  projectListApiObject,
} from "@/lib/form-api-objects";

export interface ProjectListRow {
  id: number;
  name: string;
  plan_ids?: number[];
}

export interface PlanFormOptions {
  projectOptions?: DynamicSelectOption[];
  moduleOptions?: DynamicSelectOption[];
  defaultProjectId?: string;
}

export function findProjectIdForPlan(
  projects: ProjectListRow[],
  planId: number,
  projectIdFromPlan?: number | null
): string {
  if (projectIdFromPlan != null && Number.isFinite(Number(projectIdFromPlan))) {
    return String(projectIdFromPlan);
  }
  const normalizedPlanId = Number(planId);
  const found = projects.find((p) =>
    (p.plan_ids ?? []).map(Number).includes(normalizedPlanId)
  );
  return found ? String(found.id) : "";
}

export function getEmptyPlanFormData(
  defaultProjectId = ""
): Record<string, unknown> {
  return {
    project_id: defaultProjectId,
    range_type: "monthly",
    plan_type: "",
    amount: "",
    plan_valid_days: "",
    plan_modules_id: [] as string[],
    discount_amount: "",
    features: [""],
  };
}

export function mapPlanToFormData(
  row: PlanMasterRow,
  projectId = "",
  projectLabel = ""
): Record<string, unknown> {
  const moduleIds = Array.isArray(row.plan_modules_id)
    ? row.plan_modules_id.map(String)
    : [];
  const features = Array.isArray(row.features)
    ? row.features.map(String)
    : [];
  return {
    project_id: projectId,
    _project_label: projectLabel,
    _modules_label: "",
    range_type: row.range_type === "annually" ? "annually" : "monthly",
    plan_type: row.plan_type ?? "",
    amount: row.amount != null ? String(row.amount) : "",
    plan_valid_days:
      row.plan_valid_days != null ? String(row.plan_valid_days) : "",
    plan_modules_id: moduleIds,
    discount_amount:
      row.discount_amount != null ? String(row.discount_amount) : "",
    features: features.length ? features : [""],
  };
}

export function enrichPlanFormData(
  data: Record<string, unknown>,
  options: PlanFormOptions = {}
): Record<string, unknown> {
  const next = { ...data };
  const ids = Array.isArray(next.plan_modules_id)
    ? (next.plan_modules_id as string[])
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
  if (!String(next.project_id ?? "").trim() && options.defaultProjectId) {
    next.project_id = options.defaultProjectId;
  }
  if (!String(next._project_label ?? "").trim() && options.projectOptions?.length) {
    const projectId = String(next.project_id ?? "");
    next._project_label =
      options.projectOptions.find((o) => o.value === projectId)?.label ?? "";
  }
  return next;
}

export function mapFormToPlanPayload(data: Record<string, unknown>) {
  const modules = Array.isArray(data.plan_modules_id)
    ? (data.plan_modules_id as string[])
        .map((id) => Number(id))
        .filter((n) => Number.isFinite(n))
    : [];

  const amount = Number(data.amount);
  const validDays = Number(data.plan_valid_days);
  const discountRaw = String(data.discount_amount ?? "").trim();
  const discount = discountRaw ? Number(discountRaw) : 0;

  const projectId = Number(data.project_id);
  const features = Array.isArray(data.features)
    ? (data.features as unknown[])
        .map((entry) => String(entry ?? "").trim())
        .filter(Boolean)
    : [];

  return {
    project_id: Number.isFinite(projectId) ? projectId : null,
    range_type: data.range_type === "annually" ? "annually" : "monthly",
    plan_type: String(data.plan_type ?? "").trim(),
    plan_valid_days: Number.isFinite(validDays) ? validDays : 0,
    plan_modules_id: modules,
    amount: Number.isFinite(amount) ? amount : 0,
    discount_amount: Number.isFinite(discount) ? discount : 0,
    features,
  };
}

function planFields(readOnly: boolean) {
  return [
    {
      name: "range_type",
      label: "Billing Cycle",
      type: "select" as const,
      options: [
        { label: "Monthly", value: "monthly" },
        { label: "Annually", value: "annually" },
      ],
      readOnly: true,
      condition: () => readOnly,
    },
    {
      name: "project_id",
      label: "Project",
      type: "input-sidebar" as const,
      required: true,
      placeholder: "Click to choose project",
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
      name: "plan_type",
      label: "Plan Type",
      type: "text" as const,
      required: true,
      placeholder: "e.g. Basic, Premium",
      readOnly,
    },
    {
      name: "amount",
      label: "Plan Amount (price to pay)",
      type: "number" as const,
      required: true,
      placeholder: "0",
      readOnly,
    },
    {
      name: "plan_valid_days",
      label: "Plan Valid Days",
      type: "number" as const,
      required: true,
      placeholder: "30",
      readOnly,
    },
    {
      name: "plan_modules_id",
      label: "Select Modules",
      type: "input-sidebar" as const,
      required: true,
      fullWidth: true,
      placeholder: "Click to choose modules",
      apiObject: parentModulesListApiObject,
      selectedData: "plan_modules_id",
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
    {
      name: "features",
      label: "Features",
      type: "string-list" as const,
      fullWidth: true,
      placeholder: "e.g. Unlimited tables, Priority support",
      readOnly,
    },
    {
      name: "discount_amount",
      label: "Discount (shown as savings)",
      type: "number" as const,
      placeholder: "Optional",
      readOnly,
    },
  ];
}

export function buildPlanFormConfig(
  mode: "create" | "edit" | "view",
  initialData: Record<string, unknown>,
  formOptions: PlanFormOptions = {}
): DynamicFormConfig {
  const readOnly = mode === "view";
  const fields = planFields(readOnly).map((field) => {
    if (field.name === "project_id") {
      return {
        ...field,
        viewDisplayResolver: (fd: Record<string, unknown>) =>
          String(fd._project_label ?? fd.project_id ?? ""),
      };
    }
    if (field.name === "plan_modules_id") {
      return {
        ...field,
        viewDisplayResolver: (fd: Record<string, unknown>) =>
          String(fd._modules_label ?? ""),
      };
    }
    return field;
  });

  const rangeType =
    initialData.range_type === "annually" ? "annually" : "monthly";

  return {
    title:
      mode === "view"
        ? "View Plan"
        : mode === "edit"
          ? "Edit Plan"
          : "Create Plan",
    subtitle:
      mode === "view"
        ? "Plan details (read-only)."
        : mode === "edit"
          ? "Update plan information."
          : "Add a new plan to a project.",
    mode,
    stickyFooter: true,
    submitLabel: mode === "edit" ? "Update Plan" : "Create Plan",
    cancelLabel: "Back",
    tabs: [
      { id: "monthly", label: "Monthly" },
      { id: "annually", label: "Annually" },
    ],
    tabValueField: "range_type",
    initialData: { ...initialData, range_type: rangeType },
    sections: [
      {
        title: "Plan Details",
        gridCols: "grid-cols-1 md:grid-cols-2",
        fields,
      },
    ],
  };
}
