"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/store";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

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
      <AppSidebar />
      <SidebarInset className="flex min-h-svh flex-col">
        <TopBar />
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
