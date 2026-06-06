import { CreditCard } from "lucide-react";
import type { NavRouteConfig } from "@/types/nav-route";
import RoutePlaceholder from "@/routes/route-placeholder";

export const PaymentTypeRoutes: NavRouteConfig[] = [
  {
    path: "/payment-type-master",
    key: "payment-type-master-list",
    element: RoutePlaceholder,
    islayout: true,
    isProtected: true,
    title: "Payment Type Master",
    icon: CreditCard,
    group: "management",
    roles: ["super_admin", "admin", "manager"],
  },
];
