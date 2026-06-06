"use client";

import { getRoleLabel } from "@/config/permissions";
import { isClientLoginUser, isProjectOnlyUser } from "@/lib/project-access";
import { useAuth } from "@/store";
import { useProjectPortal } from "@/store/project-portal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function SidebarProfile() {
  const { user } = useAuth();
  const { session } = useProjectPortal();
  if (!user) return null;

  const isRestaurantPreview = session?.viewMode === "restaurant";
  const isClient = isClientLoginUser(user) || isRestaurantPreview;
  const displayName = isRestaurantPreview
    ? session?.ownerName?.trim() || user.name
    : isClientLoginUser(user)
      ? user.ownerName?.trim() || user.name
      : user.name;

  const initials = displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (isClient) {
    return (
      <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3">
        <p className="truncate text-sm font-semibold text-sidebar-foreground">
          {displayName}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">Owner</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback className="bg-primary text-sm text-primary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-sidebar-foreground">
          {user.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        <Badge variant="secondary" className="mt-1.5 text-[10px]">
          {isProjectOnlyUser(user)
            ? user.roleMasterName?.trim() ||
              user.projectRoleName?.trim() ||
              getRoleLabel(user.role)
            : user.projectRoleName?.trim() || getRoleLabel(user.role)}
        </Badge>
      </div>
    </div>
  );
}
