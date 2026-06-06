"use client";

import { useEnsurePortalSession } from "@/restaurant-management-admin-panel/hooks/use-ensure-portal-session";

interface PortalProjectGateProps {
  projectId: number;
  children: React.ReactNode;
}

export function PortalProjectGate({ projectId, children }: PortalProjectGateProps) {
  const { ready, error } = useEnsurePortalSession(projectId);

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (!ready) {
    return (
      <p className="text-sm text-muted-foreground">Loading project portal...</p>
    );
  }

  return <>{children}</>;
}
