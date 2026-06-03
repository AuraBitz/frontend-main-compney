import { Building2 } from "lucide-react";
import type { NavRouteConfig } from "@/types/nav-route";
import RoutePlaceholder from "@/routes/route-placeholder";

export const ClientManagementRoutes: NavRouteConfig[] = [
  {
    path: "/client-management",
    key: "client-management-list",
    element: RoutePlaceholder,
    islayout: true,
    isProtected: true,
    title: "Clients",
    icon: Building2,
    group: "management",
    roles: ["super_admin", "admin", "manager"],
  },
];
