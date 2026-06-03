import { LayoutDashboard } from "lucide-react";
import type { NavRouteConfig } from "@/types/nav-route";
import RoutePlaceholder from "@/routes/route-placeholder";

export const DashboardRoutes: NavRouteConfig[] = [
  {
    path: "/dashboard",
    key: "dashboard",
    element: RoutePlaceholder,
    islayout: true,
    isProtected: true,
    title: "Dashboard",
    icon: LayoutDashboard,
    group: "main",
    roles: ["super_admin", "admin", "manager", "viewer"],
  },
];
