import Http from "@/services/api/http";
import { defaultListQuery } from "@/lib/list-query";
import type { ProjectRoleMasterRow } from "@/types/project-role-master.types";

export const GetProjectRoleById = (id: string | number) => {
  return Http.get<ProjectRoleMasterRow>({
    url: `/project-role-master/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const GetAllProjectRolesList = (body?: unknown) => {
  return Http.postList<ProjectRoleMasterRow>({
    url: "/project-role-master/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const GetProjectRolesByProjectId = (projectId: string | number) => {
  return Http.get<{ rows: ProjectRoleMasterRow[]; total: number }>({
    url: `/project-role-master/project/${projectId}`,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const CreateProjectRole = (body?: unknown) => {
  return Http.post({
    url: "/project-role-master",
    data: body,
    messageSettings: { successMessage: "Project role created successfully." },
  });
};

export const UpdateProjectRole = (id: string | number, body?: unknown) => {
  return Http.patch({
    url: `/project-role-master/${id}`,
    data: body,
    messageSettings: { successMessage: "Project role updated successfully." },
  });
};

export const DeleteProjectRole = (id: string | number) => {
  return Http.delete({
    url: `/project-role-master/${id}`,
    messageSettings: { successMessage: "Project role deleted successfully." },
  });
};
