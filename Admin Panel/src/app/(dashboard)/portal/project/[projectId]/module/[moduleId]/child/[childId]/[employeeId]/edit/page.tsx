"use client";

import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/layout/PageShell";
import { PortalProjectGate } from "@/restaurant-management-admin-panel/components/PortalProjectGate";
import { ProjectEmployeeMasterEdit } from "@/restaurant-management-admin-panel/features/project-employee-master";
import { portalChildPath } from "@/restaurant-management-admin-panel/lib/portal-routes";
import { useProjectPortal } from "@/store/project-portal";

function PortalChildEmployeeEditContent() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.employeeId as string;
  const projectId = Number(params.projectId);
  const parentId = Number(params.moduleId);
  const childId = Number(params.childId);
  const { session } = useProjectPortal();

  const listPath = portalChildPath(projectId, parentId, childId);

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
        onDone={() => router.push(listPath)}
        onCancel={() => router.push(listPath)}
      />
    </PageShell>
  );
}

export default function PortalChildEmployeeEditPage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  return (
    <PortalProjectGate projectId={projectId}>
      <PortalChildEmployeeEditContent />
    </PortalProjectGate>
  );
}
