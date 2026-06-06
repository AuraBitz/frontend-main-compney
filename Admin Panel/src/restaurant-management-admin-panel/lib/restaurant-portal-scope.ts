import type { SessionUser } from "@/types/auth.types";
import type { ProjectPortalSession } from "@/store/project-portal";
import {
  listQueryForProject,
  listQueryForRestaurant,
} from "@/restaurant-management-admin-panel/lib/project-filters";
import type { ListQueryPayload } from "@/lib/filter-builder-v2";
import { isClientLoginUser } from "@/lib/project-access";

export function isRestaurantPortalSession(
  session: ProjectPortalSession
): boolean {
  return session.viewMode === "restaurant";
}

export function resolveRestaurantId(
  session: ProjectPortalSession,
  user?: SessionUser | null
): number | null {
  const fromSession = session.restaurantId;
  if (fromSession != null && Number.isFinite(Number(fromSession))) {
    return Number(fromSession);
  }
  const fromUser = user?.restaurantId;
  if (fromUser != null && Number.isFinite(Number(fromUser))) {
    return Number(fromUser);
  }
  return null;
}

export function restaurantListQuery(
  session: ProjectPortalSession,
  user?: SessionUser | null
): ListQueryPayload {
  const restaurantId = resolveRestaurantId(session, user);
  if (
    restaurantId &&
    (isRestaurantPortalSession(session) || isClientLoginUser(user))
  ) {
    return listQueryForRestaurant(restaurantId);
  }
  return listQueryForProject(session.projectId);
}

export function clientLoginPortalExtras(
  user: SessionUser
): Partial<ProjectPortalSession> {
  return {
    viewMode: "restaurant",
    restaurantId: user.restaurantId ?? null,
    restaurantName: user.restaurantName ?? null,
    ownerName: user.ownerName ?? null,
    planId: user.planId ?? null,
  };
}
