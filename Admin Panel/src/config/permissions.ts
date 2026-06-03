import type { Role } from "@/types/auth.types";
import { NAV_ROUTES, type AppRoute } from "@/routes";

export type PermissionAction =
  | "client:create"
  | "client:update"
  | "client:delete"
  | "login:create"
  | "login:update"
  | "login:delete"
  | "modules:create"
  | "modules:update"
  | "modules:delete"
  | "plans:create"
  | "plans:update"
  | "plans:delete"
  | "projects:create"
  | "projects:update"
  | "projects:delete";

export const ROUTE_PERMISSIONS = Object.fromEntries(
  NAV_ROUTES.map((r) => [r.path, r.roles])
) as Record<AppRoute, Role[]>;

export const ACTION_PERMISSIONS: Record<PermissionAction, Role[]> = {
  "client:create": ["super_admin", "admin", "manager"],
  "client:update": ["super_admin", "admin", "manager"],
  "client:delete": ["super_admin", "admin"],
  "login:create": ["super_admin", "admin"],
  "login:update": ["super_admin", "admin"],
  "login:delete": ["super_admin"],
  "modules:create": ["super_admin", "admin", "manager"],
  "modules:update": ["super_admin", "admin", "manager"],
  "modules:delete": ["super_admin", "admin"],
  "plans:create": ["super_admin", "admin", "manager"],
  "plans:update": ["super_admin", "admin", "manager"],
  "plans:delete": ["super_admin", "admin"],
  "projects:create": ["super_admin", "admin", "manager"],
  "projects:update": ["super_admin", "admin", "manager"],
  "projects:delete": ["super_admin", "admin"],
};

export function canAccessRoute(role: Role, route: string): boolean {
  const path = route.split("?")[0] as AppRoute;
  const allowed = ROUTE_PERMISSIONS[path];
  if (!allowed) return true;
  return allowed.includes(role);
}

export function canPerformAction(role: Role, action: PermissionAction): boolean {
  return ACTION_PERMISSIONS[action].includes(role);
}

export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    manager: "Manager",
    viewer: "Viewer",
  };
  return labels[role];
}
