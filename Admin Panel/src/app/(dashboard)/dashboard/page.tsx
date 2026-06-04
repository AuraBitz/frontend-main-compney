"use client";

import { MainDashboardView } from "@/components/dashboard/MainDashboardView";
import { ProjectPortalDashboardView } from "@/components/dashboard/ProjectPortalDashboardView";
import { useProjectPortal } from "@/store/project-portal";

export default function DashboardPage() {
  const { isActive } = useProjectPortal();

  if (isActive) {
    return <ProjectPortalDashboardView />;
  }

  return <MainDashboardView />;
}
