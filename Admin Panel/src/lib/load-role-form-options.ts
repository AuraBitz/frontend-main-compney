import { GetAllProjectsList } from "@/services/api/projects.api";
import { defaultListQuery } from "@/lib/list-query";
import type { RoleFormOptions } from "@/lib/role-form-config";
import type { DynamicSelectOption } from "@/types/dynamic-form.types";

interface ProjectRow {
  id: number;
  name: string;
}

export async function loadRoleFormOptions(): Promise<RoleFormOptions> {
  const projects = await GetAllProjectsList(defaultListQuery);
  const projectRows = projects.rows as ProjectRow[];

  return {
    projectOptions: projectRows.map((p) => ({
      label: p.name || `Project #${p.id}`,
      value: String(p.id),
    })) as DynamicSelectOption[],
  };
}
