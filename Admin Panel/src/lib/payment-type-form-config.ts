import type { DynamicFormConfig, DynamicSelectOption } from "@/types/dynamic-form.types";
import type { PaymentTypeMasterRow } from "@/services/api/payment-type.api";

const STATUS_OPTIONS: DynamicSelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export function getEmptyPaymentTypeFormData(): Record<string, unknown> {
  return {
    type: "",
    status: "active",
  };
}

export function mapPaymentTypeToFormData(
  row: PaymentTypeMasterRow
): Record<string, unknown> {
  return {
    type: row.type ?? "",
    status: row.status ?? "active",
  };
}

export function mapFormToPaymentTypePayload(data: Record<string, unknown>) {
  return {
    type: String(data.type ?? "").trim(),
    status: String(data.status ?? "active").toLowerCase(),
  };
}

function paymentTypeFields(readOnly: boolean) {
  return [
    {
      name: "type",
      label: "Payment Type",
      type: "text" as const,
      required: true,
      placeholder: "e.g. UPI, Cash, Bank Transfer",
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
  ];
}

export function buildPaymentTypeFormConfig(
  mode: "create" | "edit" | "view",
  initialData: Record<string, unknown>
): DynamicFormConfig {
  const readOnly = mode === "view";
  const fields = paymentTypeFields(readOnly).map((field) => {
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
        ? "View Payment Type"
        : mode === "edit"
          ? "Edit Payment Type"
          : "Create Payment Type",
    subtitle:
      mode === "view"
        ? "Payment type details (read-only)."
        : mode === "edit"
          ? "Update payment type."
          : "Add a new payment type.",
    mode,
    stickyFooter: true,
    submitLabel: mode === "edit" ? "Update Payment Type" : "Create Payment Type",
    cancelLabel: "Back",
    initialData,
    sections: [
      {
        title: "Payment Type Details",
        gridCols: "grid-cols-1 md:grid-cols-2",
        fields,
      },
    ],
  };
}
