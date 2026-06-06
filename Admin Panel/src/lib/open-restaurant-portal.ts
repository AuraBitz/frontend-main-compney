import { loadProjectPortalSession } from "@/lib/load-project-portal-session";
import { portalProjectPath } from "@/restaurant-management-admin-panel/lib/portal-routes";
import { GetProjectById } from "@/services/api/projects.api";
import { GetRestaurantById } from "@/services/api/restaurant-master.api";
import type { ProjectPortalSession } from "@/store/project-portal";
import type { SessionUser } from "@/types/auth.types";
import { isClientLoginUser, isProjectOnlyUser } from "@/lib/project-access";

export async function buildRestaurantPortalSession(
  restaurantId: number | string,
  returnPath: string
): Promise<ProjectPortalSession> {
  const restaurant = await GetRestaurantById(restaurantId);
  const projectId =
    restaurant.project_id != null ? Number(restaurant.project_id) : null;

  if (!projectId || !Number.isFinite(projectId)) {
    throw new Error("This restaurant is not linked to a project.");
  }

  const project = await GetProjectById(projectId);
  const planId =
    restaurant.plan_id != null && Number.isFinite(Number(restaurant.plan_id))
      ? Number(restaurant.plan_id)
      : null;

  const base = await loadProjectPortalSession(project, {
    roleMasterId: null,
    planId: planId ?? 0,
  });

  return {
    ...base,
    viewMode: "restaurant",
    restaurantId: Number(restaurantId),
    restaurantName: restaurant.restaurant_name?.trim() || null,
    ownerName: restaurant.owner_name?.trim() || null,
    planId,
    restaurantViewReturnPath: returnPath,
  };
}

export function restaurantPortalDashboardPath(projectId: number) {
  return portalProjectPath(projectId);
}

/** Restore project-manager portal after leaving restaurant preview. */
export async function restoreProjectPortalSession(
  projectId: number,
  user: SessionUser | null | undefined
): Promise<ProjectPortalSession> {
  const project = await GetProjectById(projectId);
  return loadProjectPortalSession(project, {
    roleMasterId:
      isProjectOnlyUser(user) && !isClientLoginUser(user)
        ? user?.roleMasterId
        : null,
    planId: isClientLoginUser(user) ? (user?.planId ?? 0) : null,
  });
}
