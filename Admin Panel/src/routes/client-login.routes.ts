import { KeyRound } from "lucide-react";
import type { NavRouteConfig } from "@/types/nav-route";
import RoutePlaceholder from "@/routes/route-placeholder";

export const ClientLoginRoutes: NavRouteConfig[] = [
  {
    path: "/client-login",
    key: "client-login-list",
    element: RoutePlaceholder,
    islayout: true,
    isProtected: true,
    title: "Client Login",
    icon: KeyRound,
    group: "management",
    roles: ["super_admin", "admin"],
  },
];
