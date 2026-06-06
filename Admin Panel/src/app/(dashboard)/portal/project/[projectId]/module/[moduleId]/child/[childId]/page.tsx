"use client";

import { useParams } from "next/navigation";
import { PageShell } from "@/layout/PageShell";
import { PortalProjectGate } from "@/restaurant-management-admin-panel/components/PortalProjectGate";
import { PortalFeatureList } from "@/restaurant-management-admin-panel/features/portal-feature-list";
import { usePortalChildModule } from "@/restaurant-management-admin-panel/hooks/use-portal-child-module";

function PortalChildContent() {
  const ctx = usePortalChildModule();

  if (!ctx) {
    return (
      <PageShell title="Child Module" description="Open a project from Check Project first.">
        <p className="text-sm text-muted-foreground">
          No project portal is active or this module is not linked to the selected
          project.
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell title={ctx.childName} description={ctx.feature.description}>
      <PortalFeatureList ctx={ctx} />
    </PageShell>
  );
}

export default function PortalChildModulePage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  return (
    <PortalProjectGate projectId={projectId}>
      <PortalChildContent />
    </PortalProjectGate>
  );
}
