"use client";

import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/layout/PageShell";
import { PortalProjectGate } from "@/restaurant-management-admin-panel/components/PortalProjectGate";
import { PortalPermissionForm } from "@/restaurant-management-admin-panel/features/portal-feature-permission";
import { portalChildPath } from "@/restaurant-management-admin-panel/lib/portal-routes";
import { useProjectPortal } from "@/store/project-portal";

function PortalPermissionEditContent() {
  const params = useParams();
  const router = useRouter();
  const permissionId = params.permissionId as string;
  const projectId = Number(params.projectId);
  const parentId = Number(params.moduleId);
  const childId = Number(params.childId);
  const { session } = useProjectPortal();

  const listPath = portalChildPath(projectId, parentId, childId);

  if (!session) {
    return (
      <PageShell title="Edit Permission" description="Loading project portal...">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Edit Permission"
      description={`${session.projectName} — update module access`}
    >
      <PortalPermissionForm
        permissionId={permissionId}
        mode="edit"
        onDone={() => router.push(listPath)}
        onCancel={() => router.push(listPath)}
      />
    </PageShell>
  );
}

export default function PortalPermissionEditPage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  return (
    <PortalProjectGate projectId={projectId}>
      <PortalPermissionEditContent />
    </PortalProjectGate>
  );
}
