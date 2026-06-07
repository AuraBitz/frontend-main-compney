"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { RestaurantPlanRenewalView } from "@/components/plans/RestaurantPlanRenewalView";
import {
  isRestaurantPlanExpired,
  useRestaurantPortalClient,
} from "@/restaurant-management-admin-panel/hooks/use-restaurant-portal-client";
import { isClientLoginUser } from "@/lib/project-access";
import { useAuth } from "@/store";
import { usePlanRenewalShell } from "@/store/plan-renewal-shell";
import { useProjectPortal } from "@/store/project-portal";

interface RestaurantPortalPlanGateProps {
  projectId: number;
  children: React.ReactNode;
}

export function RestaurantPortalPlanGate({
  projectId,
  children,
}: RestaurantPortalPlanGateProps) {
  const { user } = useAuth();
  const { session } = useProjectPortal();
  const { setActive: setRenewalShell } = usePlanRenewalShell();
  const { client, loading, error, reload } = useRestaurantPortalClient(projectId);

  const isRestaurantContext =
    Boolean(session?.restaurantId) ||
    session?.viewMode === "restaurant" ||
    isClientLoginUser(user);

  const showRenewal =
    isRestaurantContext &&
    !loading &&
    !error &&
    Boolean(client && isRestaurantPlanExpired(client));

  const hideAppChrome = isRestaurantContext && (loading || showRenewal);

  useEffect(() => {
    setRenewalShell(hideAppChrome);
  }, [hideAppChrome, setRenewalShell]);

  useEffect(
    () => () => {
      setRenewalShell(false);
    },
    [setRenewalShell]
  );

  if (!isRestaurantContext) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#0b0f17] text-slate-400">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Checking subscription…
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (showRenewal && client) {
    return (
      <RestaurantPlanRenewalView
        client={client}
        projectId={projectId}
        onActivated={reload}
      />
    );
  }

  return <>{children}</>;
}
