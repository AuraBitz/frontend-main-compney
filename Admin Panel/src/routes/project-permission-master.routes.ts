import { ShieldCheck } from "lucide-react";
import type { NavRouteConfig } from "@/types/nav-route";
import RoutePlaceholder from "@/routes/route-placeholder";

export const ProjectPermissionRoutes: NavRouteConfig[] = [
  {
    path: "/project-permission-master",
    key: "project-permission-master-list",
    element: RoutePlaceholder,
    islayout: true,
    isProtected: true,
    title: "Project Permission Master",
    icon: ShieldCheck,
    group: "management",
    roles: ["super_admin", "admin"],
  },
];
