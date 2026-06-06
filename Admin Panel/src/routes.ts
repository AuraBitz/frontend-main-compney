import type { RouteConfig } from "@/types/route";
import type { NavRouteConfig, NavGroup } from "@/types/nav-route";
import { LoginRoutes } from "@/routes/login.routes";
import { DashboardRoutes } from "@/routes/dashboard.routes";
import { ClientManagementRoutes } from "@/routes/client-management.routes";
import { ClientLoginRoutes } from "@/routes/client-login.routes";
import { ParentModulesRoutes } from "@/routes/parent-modules.routes";
import { ChildModulesRoutes } from "@/routes/child-modules.routes";
import { PlansRoutes } from "@/routes/plans.routes";
import { ProjectsRoutes } from "@/routes/projects.routes";
import { RolesRoutes } from "@/routes/roles.routes";
import { PaymentTypeRoutes } from "@/routes/payment-type.routes";
import { TransactionsRoutes } from "@/routes/transactions.routes";
import { PermissionsRoutes } from "@/routes/permissions.routes";
import { PlansTrackerRoutes } from "@/routes/plans-tracker.routes";
import { ProjectPermissionRoutes } from "@/routes/project-permission-master.routes";
import { ProjectRoleRoutes } from "@/routes/project-role-master.routes";
import { EmployeeMasterRoutes } from "@/routes/employee-master.routes";

export const APP_ROUTES: RouteConfig[] = [
  ...LoginRoutes,
  ...DashboardRoutes,
  ...ClientManagementRoutes,
  ...ClientLoginRoutes,
  ...ParentModulesRoutes,
  ...ChildModulesRoutes,
  ...PlansRoutes,
  ...ProjectsRoutes,
  ...RolesRoutes,
  ...PaymentTypeRoutes,
  ...TransactionsRoutes,
  ...PermissionsRoutes,
  ...PlansTrackerRoutes,
  ...ProjectPermissionRoutes,
  ...ProjectRoleRoutes,
  ...EmployeeMasterRoutes,
];

/** Sidebar-only routes (Dashboard + Management) */
const SIDEBAR_NAV_KEYS = new Set([
  "dashboard",
  "client-management-list",
  "projects-list",
  "transaction-master-list",
  "project-role-master-list",
  "project-permission-master-list",
  "employee-master-list",
]);

export const NAV_ROUTES: NavRouteConfig[] = APP_ROUTES.filter(
  (route): route is NavRouteConfig =>
    "title" in route &&
    "icon" in route &&
    SIDEBAR_NAV_KEYS.has(route.key)
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
