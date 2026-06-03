"use client";

import { User } from "lucide-react";
import { useAuth } from "@/store";
import { getRoleLabel } from "@/config/permissions";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

export function TopBar() {
  const { user } = useAuth();

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!user) {
    return (
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <div className="min-w-0 flex-1" />
        <ThemeToggle />
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
      <SidebarTrigger className="-ml-1 shrink-0" />
      <div className="min-w-0 flex-1" />
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex max-w-[12rem] shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 outline-none hover:bg-muted sm:max-w-none"
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 text-left sm:block">
            <p className="truncate text-sm font-medium leading-none">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem disabled className="gap-2">
              <User className="h-4 w-4" />
              <Badge variant="secondary">{getRoleLabel(user.role)}</Badge>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
