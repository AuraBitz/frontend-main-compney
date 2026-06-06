"use client";

import { useParams } from "next/navigation";
import { PageShell } from "@/layout/PageShell";
import { PortalProjectGate } from "@/restaurant-management-admin-panel/components/PortalProjectGate";
import { ProjectEmployeeMasterEdit } from "@/restaurant-management-admin-panel/features/project-employee-master";
import { useProjectPortal } from "@/store/project-portal";

function ProjectEmployeeMasterEditContent() {
  const params = useParams();
  const employeeId = params.employeeId as string;
  const { session } = useProjectPortal();

  if (!session) {
    return (
      <PageShell title="Edit Employee" description="Loading project portal...">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Edit Employee"
      description={`${session.projectName} — update project employee`}
    >
      <ProjectEmployeeMasterEdit
        projectId={session.projectId}
        employeeId={employeeId}
      />
    </PageShell>
  );
}

export default function PortalEmployeeMasterEditPage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  return (
    <PortalProjectGate projectId={projectId}>
      <ProjectEmployeeMasterEditContent />
    </PortalProjectGate>
  );
}
