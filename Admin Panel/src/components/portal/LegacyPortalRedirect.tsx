"use client";

import { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  portalChildCreatePath,
  portalChildPath,
  portalModulePath,
  portalProjectPath,
} from "@/restaurant-management-admin-panel/lib/portal-routes";
import { useProjectPortal } from "@/store/project-portal";

interface LegacyPortalRedirectProps {
  mode: "module" | "child" | "create";
}

export function LegacyPortalRedirect({ mode }: LegacyPortalRedirectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { session } = useProjectPortal();

  useEffect(() => {
    const moduleId = Number(params.moduleId);
    const childId = params.childId ? Number(params.childId) : null;

    if (!session?.projectId) {
      router.replace("/projects/check");
      return;
    }

    const projectId = session.projectId;

    if (mode === "create" && childId != null && Number.isFinite(moduleId)) {
      router.replace(portalChildCreatePath(projectId, moduleId, childId));
      return;
    }

    if (mode === "child" && childId != null && Number.isFinite(moduleId)) {
      router.replace(portalChildPath(projectId, moduleId, childId));
      return;
    }

    if (Number.isFinite(moduleId)) {
      router.replace(portalModulePath(projectId, moduleId));
      return;
    }

    router.replace(portalProjectPath(projectId));
  }, [mode, params.moduleId, params.childId, pathname, router, session?.projectId]);

  return (
    <p className="text-sm text-muted-foreground">Redirecting to project portal...</p>
  );
}
