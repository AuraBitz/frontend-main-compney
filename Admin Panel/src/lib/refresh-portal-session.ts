import { clientLoginPortalExtras } from "@/restaurant-management-admin-panel/lib/restaurant-portal-scope";
import { loadProjectPortalSession } from "@/lib/load-project-portal-session";
import {
  isClientLoginUser,
  isProjectOnlyUser,
} from "@/lib/project-access";
import { GetProjectById } from "@/services/api/projects.api";
import type { ProjectPortalSession } from "@/store/project-portal";
import type { SessionUser } from "@/types/auth.types";

/** Reload portal modules after master data changes (e.g. new parent module). */
export async function refreshActivePortalSession(
  session: ProjectPortalSession,
  user: SessionUser | null | undefined
): Promise<ProjectPortalSession> {
  const project = await GetProjectById(session.projectId);
  const isRestaurant = session.viewMode === "restaurant";

  const base = await loadProjectPortalSession(project, {
    roleMasterId:
      !isRestaurant &&
      isProjectOnlyUser(user) &&
      !isClientLoginUser(user)
        ? user?.roleMasterId
        : null,
    planId:
      isRestaurant || isClientLoginUser(user)
        ? (session.planId ?? user?.planId ?? 0)
        : null,
  });

  if (!isRestaurant && !isClientLoginUser(user)) {
    return base;
  }

  const clientExtras = isClientLoginUser(user)
    ? clientLoginPortalExtras(user)
    : {};

  return {
    ...base,
    viewMode: "restaurant",
    restaurantId:
      session.restaurantId ?? clientExtras.restaurantId ?? null,
    restaurantName:
      session.restaurantName ?? clientExtras.restaurantName ?? null,
    ownerName: session.ownerName ?? clientExtras.ownerName ?? null,
    planId: session.planId ?? clientExtras.planId ?? null,
    restaurantViewReturnPath: session.restaurantViewReturnPath ?? null,
  };
}
