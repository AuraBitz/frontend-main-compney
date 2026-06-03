"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
  fullWidth?: boolean;
}

export function LogoutButton({ className, fullWidth = true }: LogoutButtonProps) {
  const { logout, isLoading } = useAuth();

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      className={cn("gap-2", fullWidth && "w-full", className)}
      disabled={isLoading}
      onClick={() => void logout()}
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}
