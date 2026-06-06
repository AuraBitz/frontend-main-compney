import type { SessionUser } from "@/types/auth.types";
import type { ProjectPortalSession } from "@/store/project-portal";

export function isManagementUser(user: SessionUser | null | undefined): boolean {
  return user?.accessType !== "project";
}

export function isProjectOnlyUser(
  user: SessionUser | null | undefined
): boolean {
  return user?.accessType === "project";
}

export function isClientLoginUser(
  user: SessionUser | null | undefined
): boolean {
  return user?.isClientLogin === true;
}

/** Restaurant owner portal (Check Restaurant preview or client login). */
export function isRestaurantPortalContext(
  session: ProjectPortalSession | null | undefined,
  user: SessionUser | null | undefined
): boolean {
  return session?.viewMode === "restaurant" || isClientLoginUser(user);
}

export function getAllowedProjectIds(user: SessionUser | null | undefined): number[] {
  if (!user?.allowedProjectIds?.length) return [];
  return user.allowedProjectIds.map(Number).filter(Number.isFinite);
}

export function canAccessProject(
  user: SessionUser | null | undefined,
  projectId: number
): boolean {
  if (isManagementUser(user)) return true;
  return getAllowedProjectIds(user).includes(projectId);
}

const PROJECT_ONLY_PATH_PREFIXES = ["/projects/check", "/portal"];

export function isProjectOnlyAllowedPath(pathname: string): boolean {
  const path = pathname.split("?")[0];
  return PROJECT_ONLY_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}
