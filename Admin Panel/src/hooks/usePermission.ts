"use client";

import { useAuth } from "@/store";
import {
  canAccessRoute,
  canPerformAction,
  type PermissionAction,
} from "@/config/permissions";
import type { AppRoute } from "@/routes";

export function usePermission() {
  const { user } = useAuth();
  const role = user?.role;

  return {
    canAccessRoute: (route: AppRoute) =>
      role ? canAccessRoute(role, route) : false,
    canPerform: (action: PermissionAction) =>
      role ? canPerformAction(role, action) : false,
    role,
  };
}
