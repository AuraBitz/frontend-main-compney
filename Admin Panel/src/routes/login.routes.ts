import type { RouteConfig } from "@/types/route";
import RoutePlaceholder from "@/routes/route-placeholder";

export const LoginRoutes: RouteConfig[] = [
  {
    path: "/login",
    key: "login",
    element: RoutePlaceholder,
    islayout: false,
    isProtected: false,
  },
];
