import Http from "@/services/api/http";
import { defaultListQuery } from "@/lib/list-query";
import type { ProjectPermissionMasterRow } from "@/types/project-permission-master.types";

export const GetProjectPermissionById = (id: string | number) => {
  return Http.get<ProjectPermissionMasterRow>({
    url: `/project-permission-master/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const GetAllProjectPermissionsList = (body?: unknown) => {
  return Http.postList<ProjectPermissionMasterRow>({
    url: "/project-permission-master/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const CreateProjectPermission = (body?: unknown) => {
  return Http.post({
    url: "/project-permission-master",
    data: body,
    messageSettings: {
      successMessage: "Project permission created successfully.",
    },
  });
};

export const UpdateProjectPermission = (id: string | number, body?: unknown) => {
  return Http.patch({
    url: `/project-permission-master/${id}`,
    data: body,
    messageSettings: {
      successMessage: "Project permission updated successfully.",
    },
  });
};

export const DeleteProjectPermission = (id: string | number) => {
  return Http.delete({
    url: `/project-permission-master/${id}`,
    messageSettings: {
      successMessage: "Project permission deleted successfully.",
    },
  });
};
