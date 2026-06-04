import { GetAllParentModulesList } from "@/services/api/parent-modules.api";
import { defaultListQuery } from "@/lib/list-query";
import type { ProjectFormOptions } from "@/lib/project-form-config";
import type { DynamicSelectOption } from "@/types/dynamic-form.types";

interface ModuleRow {
  id: number;
  module_name: string;
}

export async function loadProjectFormOptions(): Promise<ProjectFormOptions> {
  const modules = await GetAllParentModulesList(defaultListQuery);
  const moduleRows = modules.rows as ModuleRow[];

  return {
    moduleOptions: moduleRows.map((m) => ({
      label: m.module_name || `Module #${m.id}`,
      value: String(m.id),
    })) as DynamicSelectOption[],
  };
}
