import { UpdateProject } from "@/services/api/projects.api";
import type { ProjectListRow } from "@/lib/plan-form-config";

export async function linkPlanToProject(
  projectId: number,
  planId: number,
  projects: ProjectListRow[]
) {
  const project = projects.find((p) => p.id === projectId);
  if (!project) return;

  const planIds = Array.isArray(project.plan_ids) ? [...project.plan_ids] : [];
  if (!planIds.includes(planId)) {
    planIds.push(planId);
  }
  await UpdateProject(projectId, { plan_ids: planIds });
}

export async function unlinkPlanFromProject(
  projectId: number,
  planId: number,
  projects: ProjectListRow[]
) {
  const project = projects.find((p) => p.id === projectId);
  if (!project) return;

  const planIds = (project.plan_ids ?? []).filter((id) => id !== planId);
  await UpdateProject(projectId, { plan_ids: planIds });
}

export async function syncPlanProjectLink(
  planId: number,
  newProjectId: number | null,
  oldProjectId: number | null,
  projects: ProjectListRow[]
) {
  if (oldProjectId && oldProjectId !== newProjectId) {
    await unlinkPlanFromProject(oldProjectId, planId, projects);
  }
  if (newProjectId) {
    await linkPlanToProject(newProjectId, planId, projects);
  }
}
