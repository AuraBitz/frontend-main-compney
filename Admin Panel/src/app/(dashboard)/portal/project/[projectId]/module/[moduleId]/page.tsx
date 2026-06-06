"use client";

import { useParams } from "next/navigation";
import { PageShell } from "@/layout/PageShell";
import { ParentModuleHub } from "@/restaurant-management-admin-panel/components/ParentModuleHub";
import { PortalProjectGate } from "@/restaurant-management-admin-panel/components/PortalProjectGate";
import { usePortalParentModule } from "@/restaurant-management-admin-panel/hooks/use-portal-child-module";

function PortalModuleContent() {
  const ctx = usePortalParentModule();

  if (!ctx) {
    return (
      <PageShell title="Module" description="Open a project from Check Project first.">
        <p className="text-sm text-muted-foreground">
          No project portal is active or this module is not linked to the selected
          project.
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={ctx.parent.name}
      description={`${ctx.session.projectName} — child modules`}
    >
      <ParentModuleHub
        parent={ctx.parent}
        projectName={ctx.session.projectName}
        projectId={ctx.session.projectId}
      />
    </PageShell>
  );
}

export default function PortalModulePage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  return (
    <PortalProjectGate projectId={projectId}>
      <PortalModuleContent />
    </PortalProjectGate>
  );
}
