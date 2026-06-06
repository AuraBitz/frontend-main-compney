import { GitBranch } from "lucide-react";
import type { NavRouteConfig } from "@/types/nav-route";
import RoutePlaceholder from "@/routes/route-placeholder";

export const ChildModulesRoutes: NavRouteConfig[] = [
  {
    path: "/child-modules",
    key: "child-modules-list",
    element: RoutePlaceholder,
    islayout: true,
    isProtected: true,
    title: "Child Modules",
    icon: GitBranch,
    group: "modules",
    roles: ["super_admin", "admin", "manager"],
  },
];
