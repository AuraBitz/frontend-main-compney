"use client";

import { useMemo } from "react";
import { isClientLoginUser } from "@/lib/project-access";
import { resolveRestaurantId } from "@/restaurant-management-admin-panel/lib/restaurant-portal-scope";
import { useAuth } from "@/store";
import { useProjectPortal } from "@/store/project-portal";
import { RestaurantRingCaller } from "./RestaurantRingCaller";

export function RestaurantRingCallerHost() {
  const { user } = useAuth();
  const { session, hydrated } = useProjectPortal();

  const restaurantId = useMemo(() => {
    if (!hydrated) return null;

    if (session?.viewMode === "restaurant") {
      return resolveRestaurantId(session, user);
    }

    if (isClientLoginUser(user)) {
      const fromUser = user?.restaurantId;
      if (fromUser != null && Number.isFinite(Number(fromUser))) {
        return Number(fromUser);
      }
      return resolveRestaurantId(session, user);
    }

    return null;
  }, [hydrated, session, user]);

  if (!restaurantId) return null;

  return <RestaurantRingCaller restaurantId={restaurantId} />;
}
