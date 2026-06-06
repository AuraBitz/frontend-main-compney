import { GetProjectPortalModules } from "@/services/api/projects.api";
import { portalProjectPath } from "@/restaurant-management-admin-panel/lib/portal-routes";
import {
  getAllowedProjectIds,
  isClientLoginUser,
  isManagementUser,
  isProjectOnlyUser,
} from "@/lib/project-access";
import { clientLoginPortalExtras } from "@/restaurant-management-admin-panel/lib/restaurant-portal-scope";
import { persistProjectPortalSession } from "@/store/project-portal";
import type { SessionUser } from "@/types/auth.types";

/** Redirect after login based on project role permission (client + employee). */
export async function performPostLoginRedirect(user: SessionUser): Promise<void> {
  if (isManagementUser(user)) {
    window.location.assign("/dashboard");
    return;
  }

  const allowedIds = getAllowedProjectIds(user);
  if (allowedIds.length === 1) {
    try {
      const portal = await GetProjectPortalModules(allowedIds[0], {
        roleMasterId:
          isProjectOnlyUser(user) && !isClientLoginUser(user)
            ? user.roleMasterId
            : null,
        planId: isClientLoginUser(user) ? (user.planId ?? 0) : null,
      });
      persistProjectPortalSession({
        projectId: portal.projectId,
        projectName: portal.projectName,
        moduleIds: portal.moduleIds ?? [],
        modules: portal.modules ?? [],
        planIds: portal.planIds ?? [],
        status: portal.status,
        description: portal.description,
        ...(isClientLoginUser(user) ? clientLoginPortalExtras(user) : {}),
      });
      window.location.assign(portalProjectPath(allowedIds[0]));
      return;
    } catch {
      /* fall through to project picker */
    }
  }

  window.location.assign("/projects/check");
}
