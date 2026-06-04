import { ShieldCheck } from "lucide-react";
import type { NavRouteConfig } from "@/types/nav-route";
import RoutePlaceholder from "@/routes/route-placeholder";

export const RolesRoutes: NavRouteConfig[] = [
  {
    path: "/role-master",
    key: "role-master-list",
    element: RoutePlaceholder,
    islayout: true,
    isProtected: true,
    title: "Role Master",
    icon: ShieldCheck,
    group: "management",
    roles: ["super_admin", "admin"],
  },
];
