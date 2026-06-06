"use client";

import { useParams } from "next/navigation";
import { PageShell } from "@/layout/PageShell";
import { PortalProjectGate } from "@/restaurant-management-admin-panel/components/PortalProjectGate";
import { ProjectEmployeeMasterList } from "@/restaurant-management-admin-panel/features/project-employee-master";
import { useProjectPortal } from "@/store/project-portal";

function ProjectEmployeeMasterContent() {
  const { session } = useProjectPortal();

  if (!session) {
    return (
      <PageShell title="Employee Master" description="Loading project portal...">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Employee Master"
      description={`${session.projectName} — project employees`}
    >
      <ProjectEmployeeMasterList
        projectId={session.projectId}
        projectName={session.projectName}
      />
    </PageShell>
  );
}

export default function PortalEmployeeMasterPage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  return (
    <PortalProjectGate projectId={projectId}>
      <ProjectEmployeeMasterContent />
    </PortalProjectGate>
  );
}
