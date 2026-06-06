import { GetAllProjectsList } from "@/services/api/projects.api";
import { GetAllProjectPermissionsList } from "@/services/api/project-permission-master.api";
import { GetAllProjectRolesList } from "@/services/api/project-role-master.api";
import { defaultListQuery } from "@/lib/list-query";
import type { ProjectPermissionFormOptions } from "@/lib/project-permission-form-config";
import type { DynamicSelectOption } from "@/types/dynamic-form.types";

interface ProjectRow {
  id: number;
  name: string;
}

interface RoleRow {
  id: number;
  code: string;
  role_name: string;
}

export async function loadProjectPermissionFormOptions(
  excludePermissionId?: number
): Promise<ProjectPermissionFormOptions> {
  const [projects, permissions, roles] = await Promise.all([
    GetAllProjectsList(defaultListQuery),
    GetAllProjectPermissionsList(defaultListQuery),
    GetAllProjectRolesList(defaultListQuery),
  ]);

  const projectRows = projects.rows as ProjectRow[];
  const roleRows = roles.rows as RoleRow[];

  const usedRoleIds = permissions.rows
    .filter((row) => row.id !== excludePermissionId)
    .flatMap((row) => row.role_ids ?? []);

  return {
    projectOptions: projectRows.map((p) => ({
      label: p.name || `Project #${p.id}`,
      value: String(p.id),
    })) as DynamicSelectOption[],
    roleOptions: roleRows.map((r) => ({
      label: `${r.role_name} (${r.code})`,
      value: String(r.id),
    })) as DynamicSelectOption[],
    usedRoleIds,
  };
}
