"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { RestaurantRingCallerHost } from "@/restaurant-management-admin-panel/components/RestaurantRingCallerHost";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store";
import { usePlanRenewalShell } from "@/store/plan-renewal-shell";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { active: renewalShell } = usePlanRenewalShell();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      {!renewalShell ? <AppSidebar /> : null}
      <SidebarInset
        className={cn(
          "flex min-h-svh flex-col",
          renewalShell && "w-full max-w-none"
        )}
      >
        {!renewalShell ? <TopBar /> : null}
        <div
          className={cn(
            "flex-1 overflow-auto",
            renewalShell ? "p-0" : "bg-[var(--page-canvas)] p-6"
          )}
        >
          {children}
        </div>
        {!renewalShell ? <RestaurantRingCallerHost /> : null}
      </SidebarInset>
    </SidebarProvider>
  );
}
