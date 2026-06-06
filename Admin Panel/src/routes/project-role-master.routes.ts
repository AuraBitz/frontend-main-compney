import { UserCog } from "lucide-react";
import type { NavRouteConfig } from "@/types/nav-route";
import RoutePlaceholder from "@/routes/route-placeholder";

export const ProjectRoleRoutes: NavRouteConfig[] = [
  {
    path: "/project-role-master",
    key: "project-role-master-list",
    element: RoutePlaceholder,
    islayout: true,
    isProtected: true,
    title: "Project Role Master",
    icon: UserCog,
    group: "management",
    roles: ["super_admin", "admin"],
  },
];
