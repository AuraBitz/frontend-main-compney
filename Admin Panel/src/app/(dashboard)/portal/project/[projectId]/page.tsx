"use client";

import { useParams } from "next/navigation";
import { PortalDashboardRouter } from "@/components/dashboard/PortalDashboardRouter";
import { PortalProjectGate } from "@/restaurant-management-admin-panel/components/PortalProjectGate";

export default function PortalProjectHomePage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  return (
    <PortalProjectGate projectId={projectId}>
      <PortalDashboardRouter />
    </PortalProjectGate>
  );
}
