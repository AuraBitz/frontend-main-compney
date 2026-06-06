"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { portalProjectPath } from "@/restaurant-management-admin-panel/lib/portal-routes";
import { useProjectPortal } from "@/store/project-portal";

export default function PortalHomePage() {
  const router = useRouter();
  const { session } = useProjectPortal();

  useEffect(() => {
    if (session?.projectId) {
      router.replace(portalProjectPath(session.projectId));
      return;
    }
    router.replace("/projects/check");
  }, [session, router]);

  return (
    <p className="text-sm text-muted-foreground">
      Opening project portal...
    </p>
  );
}
