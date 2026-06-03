import type { LucideIcon } from "lucide-react";
import type { Role } from "@/types/auth.types";
import type { RouteConfig } from "@/types/route";

export type NavGroup = "main" | "management" | "modules";

/** Sidebar + role guard — extends RouteConfig */
export interface NavRouteConfig extends RouteConfig {
  title: string;
  icon: LucideIcon;
  group: NavGroup;
  roles: Role[];
}
