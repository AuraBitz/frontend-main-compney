import type { DynamicSelectOption } from "@/types/dynamic-form.types";
import { defaultListQuery } from "@/lib/list-query";
import { GetAllClientManagementList } from "@/services/api/client-management.api";
import { GetAllPaymentTypesList } from "@/services/api/payment-type.api";
import { GetAllPlansList } from "@/services/api/plans.api";
import { GetAllProjectsList } from "@/services/api/projects.api";
import type { TransactionFormOptions } from "@/lib/transaction-form-config";

function toOptions<T extends { id: number }>(
  rows: T[],
  labelKey: keyof T
): DynamicSelectOption[] {
  return rows.map((row) => ({
    value: String(row.id),
    label: String(row[labelKey] ?? row.id),
  }));
}

export async function loadTransactionFormOptions(): Promise<TransactionFormOptions> {
  const [paymentTypes, projects, customers, plans] = await Promise.all([
    GetAllPaymentTypesList(defaultListQuery),
    GetAllProjectsList(defaultListQuery),
    GetAllClientManagementList(defaultListQuery),
    GetAllPlansList(defaultListQuery),
  ]);

  return {
    paymentTypeOptions: toOptions(paymentTypes.rows, "type"),
    projectOptions: toOptions(projects.rows, "name"),
    customerOptions: customers.rows.map((row) => ({
      value: String(row.id),
      label: row.restaurant_name?.trim() || row.owner_name || String(row.id),
    })),
    planOptions: toOptions(plans.rows, "plan_type"),
  };
}
