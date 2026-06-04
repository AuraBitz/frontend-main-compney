"use client";

import { getRoleLabel } from "@/config/permissions";
import { useAuth } from "@/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function SidebarProfile() {
  const { user } = useAuth();
  if (!user) return null;

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
          {getRoleLabel(user.role)}
        </Badge>
      </div>
    </div>
  );
}
