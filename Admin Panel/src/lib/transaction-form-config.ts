import type { DynamicFormConfig, DynamicSelectOption } from "@/types/dynamic-form.types";
import type { TransactionMasterRow } from "@/services/api/transactions.api";
import {
  clientManagementListApiObject,
  paymentTypeListApiObject,
  planListApiObject,
  projectListApiObject,
} from "@/lib/form-api-objects";

export interface TransactionFormOptions {
  paymentTypeOptions?: DynamicSelectOption[];
  projectOptions?: DynamicSelectOption[];
  customerOptions?: DynamicSelectOption[];
  planOptions?: DynamicSelectOption[];
}

function toDateInputValue(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function getEmptyTransactionFormData(): Record<string, unknown> {
  return {
    payment_type_id: "",
    account: "",
    project_id: "",
    number: "",
    transaction_no: "",
    customer_id: "",
    transaction_date: "",
    plan_id: "",
    _payment_type_label: "",
    _project_label: "",
    _customer_label: "",
    _plan_label: "",
  };
}

export function mapTransactionToFormData(
  row: TransactionMasterRow
): Record<string, unknown> {
  return {
    payment_type_id:
      row.payment_type_id != null ? String(row.payment_type_id) : "",
    account: row.account ?? "",
    project_id: row.project_id != null ? String(row.project_id) : "",
    number: row.number ?? "",
    transaction_no: row.transaction_no ?? "",
    customer_id: row.customer_id != null ? String(row.customer_id) : "",
    transaction_date: toDateInputValue(row.transaction_date),
    plan_id: row.plan_id != null ? String(row.plan_id) : "",
    _payment_type_label: row.payment_type ?? "",
    _project_label: row.project_name ?? "",
    _customer_label: row.customer_name ?? "",
    _plan_label: row.plan_type ?? "",
  };
}

export function enrichTransactionFormData(
  data: Record<string, unknown>,
  options: TransactionFormOptions = {}
): Record<string, unknown> {
  const next = { ...data };

  if (!String(next._payment_type_label ?? "").trim() && options.paymentTypeOptions?.length) {
    const id = String(next.payment_type_id ?? "");
    next._payment_type_label =
      options.paymentTypeOptions.find((o) => o.value === id)?.label ?? "";
  }
  if (!String(next._project_label ?? "").trim() && options.projectOptions?.length) {
    const id = String(next.project_id ?? "");
    next._project_label =
      options.projectOptions.find((o) => o.value === id)?.label ?? "";
  }
  if (!String(next._customer_label ?? "").trim() && options.customerOptions?.length) {
    const id = String(next.customer_id ?? "");
    next._customer_label =
      options.customerOptions.find((o) => o.value === id)?.label ?? "";
  }
  if (!String(next._plan_label ?? "").trim() && options.planOptions?.length) {
    const id = String(next.plan_id ?? "");
    next._plan_label =
      options.planOptions.find((o) => o.value === id)?.label ?? "";
  }

  return next;
}

export function mapFormToTransactionPayload(data: Record<string, unknown>) {
  const paymentTypeId = Number(data.payment_type_id);
  const projectIdRaw = String(data.project_id ?? "").trim();
  const customerIdRaw = String(data.customer_id ?? "").trim();
  const planIdRaw = String(data.plan_id ?? "").trim();
  const transactionDate = String(data.transaction_date ?? "").trim();

  return {
    payment_type_id: paymentTypeId,
    account: String(data.account ?? "").trim() || null,
    project_id: projectIdRaw ? Number(projectIdRaw) : null,
    number: String(data.number ?? "").trim() || null,
    transaction_no: String(data.transaction_no ?? "").trim(),
    customer_id: customerIdRaw ? Number(customerIdRaw) : null,
    transaction_date: transactionDate
      ? new Date(`${transactionDate}T00:00:00.000Z`).toISOString()
      : undefined,
    plan_id: planIdRaw ? Number(planIdRaw) : null,
  };
}

function transactionFields(readOnly: boolean) {
  return [
    {
      name: "payment_type_id",
      label: "Payment Type",
      type: "api-select" as const,
      required: true,
      placeholder: "Select payment type",
      apiObject: paymentTypeListApiObject,
      selectedDataKey: { label: "type", val: "id" },
      displayedData: "type",
      cacheFieldName: "_payment_type_label",
      readOnly,
    },
    {
      name: "account",
      label: "Account",
      type: "text" as const,
      placeholder: "Account name or number",
      readOnly,
    },
    {
      name: "project_id",
      label: "Project",
      type: "input-sidebar" as const,
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
      name: "number",
      label: "Number",
      type: "text" as const,
      placeholder: "Reference number",
      readOnly,
    },
    {
      name: "transaction_no",
      label: "Transaction No",
      type: "text" as const,
      required: true,
      placeholder: "Unique transaction number",
      readOnly,
    },
    {
      name: "customer_id",
      label: "Customer",
      type: "input-sidebar" as const,
      placeholder: "Click to choose customer",
      apiObject: clientManagementListApiObject,
      selectedData: "customer_id",
      rowValueKey: "id",
      displayedData: "restaurant_name",
      displayFields: ["restaurant_name", "owner_name", "mobile"],
      customColumnDefs: [
        { key: "restaurant_name", label: "Restaurant" },
        { key: "owner_name", label: "Owner" },
        { key: "mobile", label: "Mobile" },
      ],
      cacheFieldName: "_customer_label",
      readOnly,
    },
    {
      name: "transaction_date",
      label: "Transaction Date",
      type: "date" as const,
      required: true,
      readOnly,
    },
    {
      name: "plan_id",
      label: "Plan",
      type: "api-select" as const,
      placeholder: "Select plan",
      apiObject: planListApiObject,
      selectedDataKey: { label: "plan_type", val: "id" },
      displayedData: "plan_type",
      cacheFieldName: "_plan_label",
      readOnly,
    },
  ];
}

export function buildTransactionFormConfig(
  mode: "create" | "edit" | "view",
  initialData: Record<string, unknown>
): DynamicFormConfig {
  const readOnly = mode === "view";
  const fields = transactionFields(readOnly).map((field) => {
    if (field.type === "api-select" || field.type === "input-sidebar") {
      const cacheKey = field.cacheFieldName;
      return {
        ...field,
        viewDisplayResolver: (fd: Record<string, unknown>) =>
          String(fd[cacheKey ?? ""] ?? ""),
      };
    }
    return field;
  });

  return {
    title:
      mode === "view"
        ? "View Transaction"
        : mode === "edit"
          ? "Edit Transaction"
          : "Create Transaction",
    subtitle:
      mode === "view"
        ? "Transaction details (read-only)."
        : mode === "edit"
          ? "Update transaction details."
          : "Record a new transaction.",
    mode,
    stickyFooter: true,
    submitLabel: mode === "edit" ? "Update Transaction" : "Create Transaction",
    cancelLabel: "Back",
    initialData,
    sections: [
      {
        title: "Transaction Details",
        gridCols: "grid-cols-1 md:grid-cols-2",
        fields,
      },
    ],
  };
}
