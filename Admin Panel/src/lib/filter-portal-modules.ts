import { toModuleKey } from "@/lib/permission-modules";
import type { ModulesPermissionMap } from "@/types/permission-master.types";
import type { ProjectPortalModule } from "@/store/project-portal";

/** Client-side fallback — prefer backend-filtered portal-modules API. */
export function filterPortalModulesByPermission(
  modules: ProjectPortalModule[],
  permissionModules: ModulesPermissionMap | null | undefined
): ProjectPortalModule[] {
  if (!permissionModules || typeof permissionModules !== "object") {
    return [];
  }

  const hasView = (key: string) => permissionModules[key]?.view === true;

  return modules
    .map((parent) => {
      const parentKey = toModuleKey(parent.name);
      const children = (parent.children ?? []).filter((child) => {
        const childKey = `${parentKey}_${toModuleKey(child.name)}`;
        return hasView(childKey);
      });

      if (children.length > 0) {
        return { ...parent, children };
      }

      if (hasView(parentKey)) {
        return { ...parent, children: [] };
      }

      return null;
    })
    .filter((mod): mod is ProjectPortalModule => mod != null);
}
