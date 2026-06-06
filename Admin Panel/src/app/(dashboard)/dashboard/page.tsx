"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainDashboardView } from "@/components/dashboard/MainDashboardView";
import { PortalDashboardRouter } from "@/components/dashboard/PortalDashboardRouter";
import { isProjectOnlyUser } from "@/lib/project-access";
import { useAuth } from "@/store";
import { useProjectPortal } from "@/store/project-portal";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isActive } = useProjectPortal();

  useEffect(() => {
    if (user && isProjectOnlyUser(user) && !isActive) {
      router.replace("/projects/check");
    }
  }, [user, isActive, router]);

  if (isActive) {
    return <PortalDashboardRouter />;
  }

  if (user && isProjectOnlyUser(user)) {
    return null;
  }

  return <MainDashboardView />;
}
