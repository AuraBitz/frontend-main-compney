"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/layout/PageShell";
import { Button } from "@/components/ui/button";
import { ProjectPickerGrid } from "@/components/project-portal/ProjectPickerGrid";
import { buildModuleNameMap } from "@/lib/format-module-labels";
import { clientLoginPortalExtras } from "@/restaurant-management-admin-panel/lib/restaurant-portal-scope";
import { loadProjectPortalSession } from "@/lib/load-project-portal-session";
import { portalProjectPath } from "@/restaurant-management-admin-panel/lib/portal-routes";
import { defaultListQuery } from "@/lib/list-query";
import { GetAllParentModulesList } from "@/services/api/parent-modules.api";
import { GetAllProjectsList } from "@/services/api/projects.api";
import {
  canAccessProject,
  getAllowedProjectIds,
  isClientLoginUser,
  isManagementUser,
  isProjectOnlyUser,
} from "@/lib/project-access";
import { useAuth } from "@/store";
import { useProjectPortal } from "@/store/project-portal";
import type { ProjectMasterRow } from "@/types/project-master.types";

export default function CheckProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { enterPortal } = useProjectPortal();
  const [projects, setProjects] = useState<ProjectMasterRow[]>([]);
  const [moduleNameById, setModuleNameById] = useState<Map<number, string>>(
    () => new Map()
  );
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      GetAllProjectsList(defaultListQuery),
      GetAllParentModulesList(defaultListQuery),
    ])
      .then(([projectData, moduleData]) => {
        let rows = projectData.rows;
        if (user && isProjectOnlyUser(user)) {
          const allowed = new Set(getAllowedProjectIds(user));
          rows = rows.filter((row) => allowed.has(row.id));
        }
        setProjects(rows);
        setModuleNameById(buildModuleNameMap(moduleData.rows));
        setError(
          rows.length === 0 && user && isProjectOnlyUser(user)
            ? "No projects assigned to your account. Contact administrator."
            : ""
        );
      })
      .catch((err) => {
        setProjects([]);
        setError(
          err instanceof Error ? err.message : "Failed to load projects"
        );
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSelect = async (project: ProjectMasterRow) => {
    if (!canAccessProject(user, project.id)) {
      setError("You do not have access to this project.");
      return;
    }

    setSelectingId(project.id);
    setError("");
    try {
      const session = await loadProjectPortalSession(project, {
        roleMasterId:
          isProjectOnlyUser(user) && !isClientLoginUser(user)
            ? user?.roleMasterId
            : null,
        planId: isClientLoginUser(user) ? (user?.planId ?? 0) : null,
      });
      enterPortal(
        isClientLoginUser(user)
          ? { ...session, ...clientLoginPortalExtras(user!) }
          : session
      );
      router.push(portalProjectPath(project.id));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to open project portal. Try again."
      );
    } finally {
      setSelectingId(null);
    }
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
      {isManagementUser(user) && (
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
      )}
      <ProjectPickerGrid
        projects={projects}
        moduleNameById={moduleNameById}
        loading={loading}
        selectingId={selectingId}
        onSelect={handleSelect}
      />
    </PageShell>
  );
}
