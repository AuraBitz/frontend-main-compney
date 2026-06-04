import { CreditCard } from "lucide-react";
import type { NavRouteConfig } from "@/types/nav-route";
import RoutePlaceholder from "@/routes/route-placeholder";

export const PlansRoutes: NavRouteConfig[] = [
  {
    path: "/plans",
    key: "plans-list",
    element: RoutePlaceholder,
    islayout: true,
    isProtected: true,
    title: "Plan Master",
    icon: CreditCard,
    group: "management",
    roles: ["super_admin", "admin", "manager"],
  },
];
