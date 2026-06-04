import { History } from "lucide-react";
import type { NavRouteConfig } from "@/types/nav-route";
import RoutePlaceholder from "@/routes/route-placeholder";

export const PlansTrackerRoutes: NavRouteConfig[] = [
  {
    path: "/plans-tracker",
    key: "plans-tracker-list",
    element: RoutePlaceholder,
    islayout: true,
    isProtected: true,
    title: "Plans Tracker",
    icon: History,
    group: "management",
    roles: ["super_admin", "admin", "manager", "viewer"],
  },
];
