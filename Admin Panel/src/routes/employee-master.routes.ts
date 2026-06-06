import { Users } from "lucide-react";
import type { NavRouteConfig } from "@/types/nav-route";
import RoutePlaceholder from "@/routes/route-placeholder";

export const EmployeeMasterRoutes: NavRouteConfig[] = [
  {
    path: "/employee-master",
    key: "employee-master-list",
    element: RoutePlaceholder,
    islayout: true,
    isProtected: true,
    title: "Employee Master",
    icon: Users,
    group: "management",
    roles: ["super_admin", "admin", "manager"],
  },
];
