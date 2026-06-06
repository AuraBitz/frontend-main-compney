"use client";

import { ProjectPortalDashboardView } from "@/components/dashboard/ProjectPortalDashboardView";
import { RestaurantPortalDashboardView } from "@/components/dashboard/RestaurantPortalDashboardView";
import { isRestaurantPortalContext } from "@/lib/project-access";
import { useAuth } from "@/store";
import { useProjectPortal } from "@/store/project-portal";

/** Picks project-manager vs restaurant-owner dashboard for the active portal. */
export function PortalDashboardRouter() {
  const { user } = useAuth();
  const { session } = useProjectPortal();

  if (isRestaurantPortalContext(session, user)) {
    return <RestaurantPortalDashboardView />;
  }

  return <ProjectPortalDashboardView />;
}
