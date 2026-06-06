import { ArrowLeftRight } from "lucide-react";
import type { NavRouteConfig } from "@/types/nav-route";
import RoutePlaceholder from "@/routes/route-placeholder";

export const TransactionsRoutes: NavRouteConfig[] = [
  {
    path: "/transaction-master",
    key: "transaction-master-list",
    element: RoutePlaceholder,
    islayout: true,
    isProtected: true,
    title: "Transaction Master",
    icon: ArrowLeftRight,
    group: "management",
    roles: ["super_admin", "admin", "manager"],
  },
];
