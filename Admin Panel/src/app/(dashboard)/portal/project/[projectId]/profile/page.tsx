"use client";

import { useParams } from "next/navigation";
import { RestaurantPortalProfileView } from "@/components/profile/RestaurantPortalProfileView";
import { PortalProjectGate } from "@/restaurant-management-admin-panel/components/PortalProjectGate";

export default function PortalProfilePage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  return (
    <PortalProjectGate projectId={projectId}>
      <RestaurantPortalProfileView />
    </PortalProjectGate>
  );
}
