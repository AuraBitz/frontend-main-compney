"use client";

import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/layout/PageShell";
import { PortalProjectGate } from "@/restaurant-management-admin-panel/components/PortalProjectGate";
import { PortalPermissionForm } from "@/restaurant-management-admin-panel/features/portal-feature-permission";
import {
  portalChildPath,
  portalChildPermissionEditPath,
} from "@/restaurant-management-admin-panel/lib/portal-routes";
import { useProjectPortal } from "@/store/project-portal";

function PortalPermissionViewContent() {
  const params = useParams();
  const router = useRouter();
  const permissionId = params.permissionId as string;
  const projectId = Number(params.projectId);
  const parentId = Number(params.moduleId);
  const childId = Number(params.childId);
  const { session } = useProjectPortal();

  const listPath = portalChildPath(projectId, parentId, childId);
  const editPath = portalChildPermissionEditPath(
    projectId,
    parentId,
    childId,
    permissionId
  );

  if (!session) {
    return (
      <PageShell title="View Permission" description="Loading project portal...">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="View Permission"
      description={`${session.projectName} — role-wise module permissions`}
    >
      <PortalPermissionForm
        permissionId={permissionId}
        mode="view"
        onCancel={() => router.push(listPath)}
        onDone={() => router.push(editPath)}
      />
    </PageShell>
  );
}

export default function PortalPermissionViewPage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  return (
    <PortalProjectGate projectId={projectId}>
      <PortalPermissionViewContent />
    </PortalProjectGate>
  );
}
