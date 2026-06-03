import type { RouteConfig } from "@/types/route";
import type { NavRouteConfig, NavGroup } from "@/types/nav-route";
import { LoginRoutes } from "@/routes/login.routes";
import { DashboardRoutes } from "@/routes/dashboard.routes";
import { ClientManagementRoutes } from "@/routes/client-management.routes";
import { ClientLoginRoutes } from "@/routes/client-login.routes";
import { ParentModulesRoutes } from "@/routes/parent-modules.routes";
import { SubModulesRoutes } from "@/routes/sub-modules.routes";
import { PlansRoutes } from "@/routes/plans.routes";
import { ProjectsRoutes } from "@/routes/projects.routes";

export const APP_ROUTES: RouteConfig[] = [
  ...LoginRoutes,
  ...DashboardRoutes,
  ...ClientManagementRoutes,
  ...ClientLoginRoutes,
  ...ParentModulesRoutes,
  ...SubModulesRoutes,
  ...PlansRoutes,
  ...ProjectsRoutes,
];

export const NAV_ROUTES: NavRouteConfig[] = APP_ROUTES.filter(
  (route): route is NavRouteConfig => "title" in route && "icon" in route
);

export type AppRoute = NavRouteConfig["path"] | "/login";

export const NAV_GROUPS: Record<NavGroup, string> = {
  main: "Main",
  management: "Management",
  modules: "Modules",
};

export const LOGIN_PATH = "/login" as const;

export const AUTH_ROUTES = LoginRoutes.map((r) => r.path);

export const PROTECTED_PATHS = APP_ROUTES.filter((r) => r.isProtected).map(
  (r) => r.path
);
