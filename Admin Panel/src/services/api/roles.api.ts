import Http from "@/services/api/http";
import { defaultListQuery } from "@/lib/list-query";

export interface RoleMasterRow {
  id: number;
  role_code: string;
  role_name: string;
  description?: string | null;
  project_ids?: number[];
  status: string;
  created_at?: string;
  created_by?: number | null;
  created_by_name?: string | null;
}

export const GetRoleById = (id: string | number) => {
  return Http.get<RoleMasterRow>({
    url: `/roles-master/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const GetAllRolesList = (body?: unknown) => {
  return Http.postList<RoleMasterRow>({
    url: "/roles-master/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const GetRolesByProjectId = (projectId: string | number) => {
  return Http.get<{ rows: RoleMasterRow[]; total: number }>({
    url: `/roles-master/project/${projectId}`,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const CreateRole = (body?: unknown) => {
  return Http.post({
    url: "/roles-master",
    data: body,
    messageSettings: { successMessage: "Role created successfully." },
  });
};

export const UpdateRole = (id: string | number, body?: unknown) => {
  return Http.patch({
    url: `/roles-master/${id}`,
    data: body,
    messageSettings: { successMessage: "Role updated successfully." },
  });
};

export const DeleteRole = (id: string | number) => {
  return Http.delete({
    url: `/roles-master/${id}`,
    messageSettings: { successMessage: "Role deleted successfully." },
  });
};
