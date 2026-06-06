"use client";

import { useParams } from "next/navigation";
import { PageShell } from "@/layout/PageShell";
import { PortalProjectGate } from "@/restaurant-management-admin-panel/components/PortalProjectGate";
import { PortalFeatureCreate } from "@/restaurant-management-admin-panel/features/portal-feature-create";
import { usePortalChildModule } from "@/restaurant-management-admin-panel/hooks/use-portal-child-module";
import { resolveEffectivePortalFeature } from "@/restaurant-management-admin-panel/lib/module-registry";

function PortalChildCreateContent() {
  const ctx = usePortalChildModule();

  if (!ctx) {
    return (
      <PageShell title="Create" description="Open a project from Check Project first.">
        <p className="text-sm text-muted-foreground">
          No project portal is active or this module is not linked to the selected
          project.
        </p>
      </PageShell>
    );
  }

  const effectiveFeature = resolveEffectivePortalFeature(
    ctx.childName,
    ctx.feature,
    ctx.session
  );

  if (!effectiveFeature.supportsCreate) {
    return (
      <PageShell title={ctx.childName} description="Create not available">
        <p className="text-sm text-muted-foreground">
          Create is not enabled for {ctx.childName} in this project portal.
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`Create ${ctx.childName}`}
      description={`${ctx.session.projectName} · ${ctx.parentName}`}
    >
      <PortalFeatureCreate ctx={ctx} />
    </PageShell>
  );
}

export default function PortalChildCreatePage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  return (
    <PortalProjectGate projectId={projectId}>
      <PortalChildCreateContent />
    </PortalProjectGate>
  );
}
