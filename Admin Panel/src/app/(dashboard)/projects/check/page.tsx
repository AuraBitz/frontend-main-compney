"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/layout/PageShell";
import { Button } from "@/components/ui/button";
import { ProjectPickerGrid } from "@/components/project-portal/ProjectPickerGrid";
import { buildModuleNameMap } from "@/lib/format-module-labels";
import { defaultListQuery } from "@/lib/list-query";
import { GetAllParentModulesList } from "@/services/api/parent-modules.api";
import { GetAllProjectsList } from "@/services/api/projects.api";
import { useProjectPortal } from "@/store/project-portal";
import type { ProjectMasterRow } from "@/types/project-master.types";

export default function CheckProjectPage() {
  const router = useRouter();
  const { enterPortal } = useProjectPortal();
  const [projects, setProjects] = useState<ProjectMasterRow[]>([]);
  const [moduleNameById, setModuleNameById] = useState<Map<number, string>>(
    () => new Map()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      GetAllProjectsList(defaultListQuery),
      GetAllParentModulesList(defaultListQuery),
    ])
      .then(([projectData, moduleData]) => {
        setProjects(projectData.rows);
        setModuleNameById(buildModuleNameMap(moduleData.rows));
        setError("");
      })
      .catch((err) => {
        setProjects([]);
        setError(
          err instanceof Error ? err.message : "Failed to load projects"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSelect = (project: ProjectMasterRow) => {
    const moduleIds = (project.module_ids ?? []).map(Number).filter(Number.isFinite);
    const modules = moduleIds.map((id) => ({
      id,
      name: moduleNameById.get(id) ?? `Module #${id}`,
    }));

    enterPortal({
      projectId: project.id,
      projectName: project.name,
      moduleIds,
      modules,
      planIds: project.plan_ids ?? [],
      status: project.status,
      description: project.description,
    });
    router.push("/dashboard");
  };

  return (
    <PageShell
      title="Check Project"
      description="Select a project to open its module portal"
    >
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="mb-6">
        <Button
          variant="outline"
          render={<Link href="/projects" />}
          className="h-10 gap-2"
        >
          <ArrowLeft className="size-4" />
          Back to Project Master
        </Button>
      </div>
      <ProjectPickerGrid
        projects={projects}
        moduleNameById={moduleNameById}
        loading={loading}
        onSelect={handleSelect}
      />
    </PageShell>
  );
}
