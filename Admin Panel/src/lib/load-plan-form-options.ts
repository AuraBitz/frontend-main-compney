import { GetAllParentModulesList } from "@/services/api/parent-modules.api";
import { GetAllProjectsList } from "@/services/api/projects.api";
import { defaultListQuery } from "@/lib/list-query";
import type { PlanFormOptions } from "@/lib/plan-form-config";
import type { DynamicSelectOption } from "@/types/dynamic-form.types";

interface ProjectRow {
  id: number;
  name: string;
}

interface ModuleRow {
  id: number;
  module_name: string;
}

export async function loadPlanFormOptions(): Promise<PlanFormOptions> {
  const [projects, modules] = await Promise.all([
    GetAllProjectsList(defaultListQuery),
    GetAllParentModulesList(defaultListQuery),
  ]);

  const projectRows = projects.rows as ProjectRow[];
  const moduleRows = modules.rows as ModuleRow[];

  return {
    projectOptions: projectRows.map((p) => ({
      label: p.name || `Project #${p.id}`,
      value: String(p.id),
    })) as DynamicSelectOption[],
    moduleOptions: moduleRows.map((m) => ({
      label: m.module_name || `Module #${m.id}`,
      value: String(m.id),
    })) as DynamicSelectOption[],
  };
}
