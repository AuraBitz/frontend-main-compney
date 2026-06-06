import Http from "@/services/api/http";
import { defaultListQuery } from "@/lib/list-query";
import type { PermissionMasterRow } from "@/types/permission-master.types";

export const GetPermissionById = (id: string | number) => {
  return Http.get<PermissionMasterRow>({
    url: `/permissions-master/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const GetAllPermissionsList = (body?: unknown) => {
  return Http.postList<PermissionMasterRow>({
    url: "/permissions-master/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const CreatePermission = (body?: unknown) => {
  return Http.post({
    url: "/permissions-master",
    data: body,
    messageSettings: { successMessage: "Permission created successfully." },
  });
};

export const UpdatePermission = (id: string | number, body?: unknown) => {
  return Http.patch({
    url: `/permissions-master/${id}`,
    data: body,
    messageSettings: { successMessage: "Permission updated successfully." },
  });
};

export const DeletePermission = (id: string | number) => {
  return Http.delete({
    url: `/permissions-master/${id}`,
    messageSettings: { successMessage: "Permission deleted successfully." },
  });
};
