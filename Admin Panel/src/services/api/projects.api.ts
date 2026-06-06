import Http from "@/services/api/http";
import type { ProjectPortalModule } from "@/store/project-portal";
import type { ProjectMasterRow } from "@/types/project-master.types";

export interface ProjectPortalModulesPayload {
  projectId: number;
  projectName: string;
  moduleIds: number[];
  planIds: number[];
  status?: string;
  description?: string | null;
  modules: ProjectPortalModule[];
}

export const GetProjectPortalModules = (
  id: string | number,
  options?: { roleMasterId?: number | null; planId?: number | null }
) => {
  const params = new URLSearchParams();
  const roleId = options?.roleMasterId;
  const planId = options?.planId;
  if (roleId != null && Number.isFinite(Number(roleId)) && Number(roleId) > 0) {
    params.set("roleId", String(Number(roleId)));
  }
  if (planId != null && Number.isFinite(Number(planId))) {
    params.set("planId", String(Number(planId)));
  }
  const query = params.toString() ? `?${params.toString()}` : "";
  return Http.get<ProjectPortalModulesPayload>({
    url: `/projects/${id}/portal-modules${query}`,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const GetProjectById = (id: string | number) => {
  return Http.get<ProjectMasterRow>({
    url: `/projects/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const GetAllProjectsList = (body?: unknown) => {
  return Http.postList<ProjectMasterRow>({
    url: "/projects/list",
    data: body,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const CreateProject = (body?: unknown) => {
  return Http.post({
    url: "/projects",
    data: body,
    messageSettings: { successMessage: "Project created successfully." },
  });
};

export const UpdateProject = (id: string | number, body?: unknown) => {
  return Http.patch({
    url: `/projects/${id}`,
    data: body,
    messageSettings: { successMessage: "Project updated successfully." },
  });
};

export const DeleteProject = (id: string | number) => {
  return Http.delete({
    url: `/projects/${id}`,
    messageSettings: { successMessage: "Project deleted successfully." },
  });
};
