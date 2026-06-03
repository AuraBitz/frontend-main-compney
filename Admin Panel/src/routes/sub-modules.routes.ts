import { GitBranch } from "lucide-react";
import type { NavRouteConfig } from "@/types/nav-route";
import RoutePlaceholder from "@/routes/route-placeholder";

export const SubModulesRoutes: NavRouteConfig[] = [
  {
    path: "/sub-modules",
    key: "sub-modules-list",
    element: RoutePlaceholder,
    islayout: true,
    isProtected: true,
    title: "Sub Modules",
    icon: GitBranch,
    group: "modules",
    roles: ["super_admin", "admin", "manager"],
  },
];
