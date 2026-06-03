import { FolderKanban } from "lucide-react";
import type { NavRouteConfig } from "@/types/nav-route";
import RoutePlaceholder from "@/routes/route-placeholder";

export const ProjectsRoutes: NavRouteConfig[] = [
  {
    path: "/projects",
    key: "projects-list",
    element: RoutePlaceholder,
    islayout: true,
    isProtected: true,
    title: "Projects",
    icon: FolderKanban,
    group: "modules",
    roles: ["super_admin", "admin", "manager"],
  },
];
