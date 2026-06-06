"use client";

import { useParams } from "next/navigation";
import { PageShell } from "@/layout/PageShell";
import { PortalProjectGate } from "@/restaurant-management-admin-panel/components/PortalProjectGate";
import { ProjectEmployeeMasterCreate } from "@/restaurant-management-admin-panel/features/project-employee-master";
import { useProjectPortal } from "@/store/project-portal";

function ProjectEmployeeMasterCreateContent() {
  const { session } = useProjectPortal();

  if (!session) {
    return (
      <PageShell title="Create Employee" description="Loading project portal...">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Create Employee"
      description={`${session.projectName} — add project employee`}
    >
      <ProjectEmployeeMasterCreate
        projectId={session.projectId}
        projectName={session.projectName}
      />
    </PageShell>
  );
}

export default function PortalEmployeeMasterCreatePage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  return (
    <PortalProjectGate projectId={projectId}>
      <ProjectEmployeeMasterCreateContent />
    </PortalProjectGate>
  );
}
