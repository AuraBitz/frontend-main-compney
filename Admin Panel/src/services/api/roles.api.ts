import Http from "@/services/api/http";
import { defaultListQuery } from "@/lib/list-query";

export interface RoleMasterRow {
  id: number;
  role_code: string;
  role_name: string;
  description?: string | null;
  status: string;
  created_at?: string;
}

export const GetAllRolesList = (body?: unknown) => {
  return Http.postList<RoleMasterRow>({
    url: "/roles-master/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });
};
