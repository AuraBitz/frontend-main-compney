import { defaultListQuery } from "@/lib/list-query";
import { GetAllParentModulesList } from "@/services/api/parent-modules.api";
import { GetAllChildModulesList } from "@/services/api/child-modules.api";
import type {
  ModulePermissionFlags,
  ModulesPermissionMap,
  PermissionModuleGroup,
} from "@/types/permission-master.types";

export function toModuleKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function emptyModuleFlags(): ModulePermissionFlags {
  return {
    view: false,
    create: false,
    edit: false,
    delete: false,
    download: false,
  };
}

export function flattenPermissionModules(
  groups: PermissionModuleGroup[]
): { key: string; label: string }[] {
  const rows: { key: string; label: string }[] = [];
  for (const group of groups) {
    rows.push({ key: group.key, label: group.label });
    for (const child of group.children) {
      rows.push({ key: child.key, label: child.label });
    }
  }
  return rows;
}

export function countPermissionModules(groups: PermissionModuleGroup[]): number {
  return groups.reduce((total, group) => total + 1 + group.children.length, 0);
}

export function buildEmptyModulesMap(
  moduleGroups: PermissionModuleGroup[]
): ModulesPermissionMap {
  return Object.fromEntries(
    flattenPermissionModules(moduleGroups).map((row) => [
      row.key,
      emptyModuleFlags(),
    ])
  );
}

export function mergeModulesWithCatalog(
  stored: ModulesPermissionMap | null | undefined,
  moduleGroups: PermissionModuleGroup[]
): ModulesPermissionMap {
  const base = buildEmptyModulesMap(moduleGroups);
  if (!stored || typeof stored !== "object") return base;

  for (const row of flattenPermissionModules(moduleGroups)) {
    const flags = stored[row.key];
    if (flags && typeof flags === "object") {
      base[row.key] = {
        view: Boolean(flags.view),
        create: Boolean(flags.create),
        edit: Boolean(flags.edit),
        delete: Boolean(flags.delete),
        download: Boolean(flags.download),
      };
    }
  }
  return base;
}

export function countConfiguredModules(modules: ModulesPermissionMap): number {
  return Object.values(modules).filter((flags) =>
    Object.values(flags).some(Boolean)
  ).length;
}

export async function loadPermissionModuleRows(): Promise<PermissionModuleGroup[]> {
  const [parentsResult, childrenResult] = await Promise.all([
    GetAllParentModulesList(defaultListQuery),
    GetAllChildModulesList(defaultListQuery),
  ]);

  const parents = parentsResult.rows ?? [];
  const children = childrenResult.rows ?? [];

  return parents.map((parent) => {
    const parentKey = toModuleKey(parent.module_name);
    return {
      key: parentKey,
      label: parent.module_name,
      children: children
        .filter((child) => child.parent_module_id === parent.id)
        .map((child) => ({
          key: `${parentKey}_${toModuleKey(child.child_module_name)}`,
          label: child.child_module_name,
        })),
    };
  });
}
