"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Layers } from "lucide-react";
import { PageShell } from "@/layout/PageShell";
import { useProjectPortal } from "@/store/project-portal";

export default function PortalModulePage() {
  const params = useParams();
  const moduleId = Number(params.moduleId);
  const { session } = useProjectPortal();

  const moduleItem = useMemo(
    () => session?.modules.find((m) => m.id === moduleId),
    [session, moduleId]
  );

  if (!session) {
    return (
      <PageShell title="Module" description="Open a project from Check Project first.">
        <p className="text-sm text-muted-foreground">
          No project portal is active.
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={moduleItem?.name ?? `Module #${moduleId}`}
      description={`${session.projectName} — module workspace`}
    >
      <div className="flex max-w-lg flex-col items-center rounded-xl border border-border/80 bg-card px-8 py-12 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <Layers className="size-7" />
        </div>
        <p className="text-lg font-semibold text-foreground">
          {moduleItem?.name ?? "Module"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          This module belongs to project{" "}
          <span className="font-medium text-foreground">{session.projectName}</span>.
        </p>
      </div>
    </PageShell>
  );
}
