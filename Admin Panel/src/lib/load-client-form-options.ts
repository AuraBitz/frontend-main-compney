import { GetAllPlansList } from "@/services/api/plans.api";
import { GetAllProjectsList } from "@/services/api/projects.api";
import { GetAllRolesList } from "@/services/api/roles.api";
import { defaultListQuery } from "@/lib/list-query";
import type { ClientFormOptions } from "@/lib/client-form-config";
import type { DynamicSelectOption } from "@/types/dynamic-form.types";

interface PlanRow {
  id: number;
  plan_type: string;
}

interface ProjectRow {
  id: number;
  name: string;
}

export async function loadClientFormOptions(): Promise<ClientFormOptions> {
  const [plans, projects, roles] = await Promise.all([
    GetAllPlansList(defaultListQuery),
    GetAllProjectsList(defaultListQuery),
    GetAllRolesList(defaultListQuery),
  ]);

  const planRows = plans.rows as PlanRow[];
  const projectRows = projects.rows as ProjectRow[];
  const roleRows = roles.rows as { role_name: string; role_code: string }[];

  return {
    planOptions: planRows.map((p) => ({
      label: p.plan_type || `Plan #${p.id}`,
      value: String(p.id),
    })) as DynamicSelectOption[],
    projectOptions: projectRows.map((p) => ({
      label: p.name || `Project #${p.id}`,
      value: String(p.id),
    })) as DynamicSelectOption[],
    roleOptions: roleRows.map((r) => ({
      label: r.role_name || r.role_code,
      value: r.role_code,
    })),
  };
}
