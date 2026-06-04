"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notifyInfo } from "@/components/Notifications/notification";

export function NotificationButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="relative h-9 w-9 shrink-0"
            aria-label="Notifications"
          />
        }
      >
        <Bell className="size-4" />
        <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <p className="px-2 py-3 text-sm text-muted-foreground">
            No new notifications.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mx-2 mb-2 w-[calc(100%-1rem)]"
            onClick={() => notifyInfo("Notifications coming soon.")}
          >
            View all
          </Button>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
