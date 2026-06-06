"use client";

import Link from "next/link";
import { List, Plus } from "lucide-react";
import {
  getChildModuleIcon,
  PortalNavIcon,
} from "@/restaurant-management-admin-panel/lib/portal-module-icons";
import { Button } from "@/components/ui/button";
import {
  getPortalFeaturePaths,
  resolvePortalFeature,
} from "@/restaurant-management-admin-panel/lib/module-registry";
import type { ProjectPortalModule } from "@/store/project-portal";

interface ParentModuleHubProps {
  parent: ProjectPortalModule;
  projectName: string;
  projectId: number;
}

export function ParentModuleHub({
  parent,
  projectName,
  projectId,
}: ParentModuleHubProps) {
  const children = parent.children ?? [];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {projectName} — select a child module to view project-scoped data.
      </p>

      {children.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No child modules under {parent.name}. Add child modules in Child Modules master.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => {
            const feature = resolvePortalFeature(parent.name, child.name);
            const paths = getPortalFeaturePaths(projectId, parent.id, child.id);
            const ChildIcon = getChildModuleIcon(child.name);

            return (
              <div
                key={child.id}
                className="flex flex-col rounded-xl border border-border/80 bg-card p-5 shadow-sm"
              >
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <PortalNavIcon icon={ChildIcon} className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">{child.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    render={<Link href={paths.list} />}
                  >
                    <List className="size-3.5" />
                    List
                  </Button>
                  {feature.supportsCreate && (
                    <Button
                      size="sm"
                      className="gap-1.5"
                      render={<Link href={paths.create} />}
                    >
                      <Plus className="size-3.5" />
                      Create
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
