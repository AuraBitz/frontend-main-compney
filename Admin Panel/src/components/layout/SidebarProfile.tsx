"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getRoleLabel } from "@/config/permissions";
import { isClientLoginUser, isProjectOnlyUser } from "@/lib/project-access";
import { portalProfilePath } from "@/restaurant-management-admin-panel/lib/portal-routes";
import { useAuth } from "@/store";
import { useProjectPortal } from "@/store/project-portal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function ProfileAvatar({ initials }: { initials?: string }) {
  return (
    <Avatar className="size-10 shrink-0 ring-2 ring-primary/20 ring-offset-2 ring-offset-sidebar">
      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-sm font-semibold text-white">
        {initials || "U"}
      </AvatarFallback>
    </Avatar>
  );
}

export function SidebarProfile() {
  const router = useRouter();
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

  const subtitle = isClient
    ? session?.restaurantName?.trim() || "Restaurant owner"
    : user.email;

  const initials = displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const profileHref =
    session?.projectId != null ? portalProfilePath(session.projectId) : null;

  const openProfile = () => {
    if (profileHref) router.push(profileHref);
  };

  return (
    <button
      type="button"
      onClick={openProfile}
      disabled={!profileHref}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3 text-left transition-colors",
        profileHref
          ? "cursor-pointer hover:border-primary/30 hover:bg-primary/5"
          : "cursor-default"
      )}
    >
      <ProfileAvatar initials={initials} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-sidebar-foreground">
          {displayName}
        </p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        {!isClient ? (
          <Badge variant="secondary" className="mt-1.5 text-[10px]">
            {isProjectOnlyUser(user)
              ? user.roleMasterName?.trim() ||
                user.projectRoleName?.trim() ||
                getRoleLabel(user.role)
              : user.projectRoleName?.trim() || getRoleLabel(user.role)}
          </Badge>
        ) : null}
      </div>
      {profileHref ? (
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      ) : null}
    </button>
  );
}
