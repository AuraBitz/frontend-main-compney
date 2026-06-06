import { buildPortalModuleTree } from "@/lib/build-portal-modules";
import { defaultListQuery } from "@/lib/list-query";
import { GetAllChildModulesList } from "@/services/api/child-modules.api";
import { GetAllParentModulesList } from "@/services/api/parent-modules.api";
import {
  GetProjectPortalModules,
  type ProjectPortalModulesPayload,
} from "@/services/api/projects.api";
import type { ProjectPortalSession } from "@/store/project-portal";
import type { ProjectMasterRow } from "@/types/project-master.types";

function portalPayloadToSession(
  payload: ProjectPortalModulesPayload
): ProjectPortalSession {
  return {
    projectId: payload.projectId,
    projectName: payload.projectName,
    moduleIds: payload.moduleIds ?? [],
    modules: payload.modules ?? [],
    planIds: payload.planIds ?? [],
    status: payload.status,
    description: payload.description,
  };
}

export interface LoadProjectPortalSessionOptions {
  /** Role Master id — filters modules via permission_master (project-only employees). */
  roleMasterId?: number | null;
  /** Client plan id — filters modules via plans_master.plan_modules_id. */
  planId?: number | null;
}

/** Load portal session from API; falls back to client-side tree if API route is unavailable. */
export async function loadProjectPortalSession(
  project: ProjectMasterRow,
  options: LoadProjectPortalSessionOptions = {}
): Promise<ProjectPortalSession> {
  const roleMasterId = options.roleMasterId ?? null;
  const planId = options.planId ?? null;
  try {
    const portal = await GetProjectPortalModules(project.id, {
      roleMasterId,
      planId,
    });
    return portalPayloadToSession(portal);
  } catch {
    const moduleIds = (project.module_ids ?? [])
      .map(Number)
      .filter(Number.isFinite);
    const [parentData, childData] = await Promise.all([
      GetAllParentModulesList(defaultListQuery),
      GetAllChildModulesList(defaultListQuery),
    ]);
    const modules = buildPortalModuleTree(
      moduleIds,
      parentData.rows,
      childData.rows
    );

    return {
      projectId: project.id,
      projectName: project.name,
      moduleIds,
      modules,
      planIds: project.plan_ids ?? [],
      status: project.status,
      description: project.description,
    };
  }
}
