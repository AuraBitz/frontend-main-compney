"use client";

import type { PermissionAction } from "@/config/permissions";
import { usePermission } from "@/hooks/usePermission";

interface CanAccessProps {
  action: PermissionAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function CanAccess({ action, children, fallback = null }: CanAccessProps) {
  const { canPerform } = usePermission();
  return canPerform(action) ? <>{children}</> : <>{fallback}</>;
}
