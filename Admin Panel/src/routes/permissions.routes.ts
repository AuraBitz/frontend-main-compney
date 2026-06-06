import { KeyRound } from "lucide-react";
import type { NavRouteConfig } from "@/types/nav-route";
import RoutePlaceholder from "@/routes/route-placeholder";

export const PermissionsRoutes: NavRouteConfig[] = [
  {
    path: "/permission-master",
    key: "permission-master-list",
    element: RoutePlaceholder,
    islayout: true,
    isProtected: true,
    title: "Permission Master",
    icon: KeyRound,
    group: "management",
    roles: ["super_admin", "admin"],
  },
];
