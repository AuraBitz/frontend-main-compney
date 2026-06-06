import type { ChildModuleRow } from "@/services/api/child-modules.api";
import type { ParentModuleRow } from "@/lib/parent-module-form-config";
import type { ProjectPortalModule } from "@/store/project-portal";

export function buildPortalModuleTree(
  moduleIds: number[],
  parents: ParentModuleRow[],
  children: ChildModuleRow[]
): ProjectPortalModule[] {
  const idSet = new Set(moduleIds.map(Number));
  const parentRows = parents.filter(
    (p) => idSet.has(p.id) && String(p.status ?? "active").toLowerCase() !== "inactive"
  );

  return parentRows.map((parent) => ({
    id: parent.id,
    name: parent.module_name,
    children: children
      .filter((c) => c.parent_module_id === parent.id)
      .map((c) => ({
        id: c.id,
        name: c.child_module_name,
        parentId: parent.id,
      })),
  }));
}
