"use client";

import { FolderKanban } from "lucide-react";
import type { ProjectMasterRow } from "@/types/project-master.types";
import { cn } from "@/lib/utils";

interface ProjectPickerGridProps {
  projects: ProjectMasterRow[];
  moduleNameById: Map<number, string>;
  loading?: boolean;
  onSelect: (project: ProjectMasterRow) => void;
}

export function ProjectPickerGrid({
  projects,
  moduleNameById,
  loading = false,
  onSelect,
}: ProjectPickerGridProps) {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading projects...</p>
    );
  }

  if (!projects.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
        <p className="text-sm font-medium text-foreground">No projects found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a project first, then open it from here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => {
        const moduleLabels = (project.module_ids ?? [])
          .map((id) => moduleNameById.get(Number(id)))
          .filter((name): name is string => Boolean(name));

        return (
          <button
            key={project.id}
            type="button"
            onClick={() => onSelect(project)}
            className={cn(
              "group flex flex-col rounded-xl border border-border/80 bg-card p-5 text-left shadow-sm",
              "transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <FolderKanban className="size-5" />
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                  project.status === "active"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {project.status ?? "—"}
              </span>
            </div>
            <h3 className="text-base font-semibold tracking-tight text-foreground group-hover:text-primary">
              {project.name}
            </h3>
            {project.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {project.description}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">No description</p>
            )}
            <p className="mt-4 text-xs font-medium text-muted-foreground">
              Modules
            </p>
            <p className="mt-0.5 text-sm text-foreground">
              {moduleLabels.length ? moduleLabels.join(", ") : "—"}
            </p>
          </button>
        );
      })}
    </div>
  );
}
