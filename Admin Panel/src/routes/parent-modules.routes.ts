import { Layers } from "lucide-react";
import type { NavRouteConfig } from "@/types/nav-route";
import RoutePlaceholder from "@/routes/route-placeholder";

export const ParentModulesRoutes: NavRouteConfig[] = [
  {
    path: "/parent-modules",
    key: "parent-modules-list",
    element: RoutePlaceholder,
    islayout: true,
    isProtected: true,
    title: "Parent Modules",
    icon: Layers,
    group: "modules",
    roles: ["super_admin", "admin", "manager"],
  },
];
