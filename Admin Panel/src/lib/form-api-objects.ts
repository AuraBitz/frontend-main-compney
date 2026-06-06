import type { ListQueryPayload } from "@/lib/filter-builder-v2";
import { GetAllClientLoginList } from "@/services/api/client-login.api";
import { GetAllClientManagementList } from "@/services/api/client-management.api";
import { GetAllParentModulesList } from "@/services/api/parent-modules.api";
import { GetAllPaymentTypesList } from "@/services/api/payment-type.api";
import { GetAllPlansList } from "@/services/api/plans.api";
import { GetAllProjectsList } from "@/services/api/projects.api";
import { GetAllProjectRolesList } from "@/services/api/project-role-master.api";
import { GetAllRestaurantsList } from "@/services/api/restaurant-master.api";
import { GetAllRolesList, GetRolesByProjectId } from "@/services/api/roles.api";
import type { ListApiObject } from "@/types/list-api.types";

export const projectListApiObject: ListApiObject<{
  id: number;
  name: string;
}> = {
  list: GetAllProjectsList,
};

export const planListApiObject: ListApiObject<{
  id: number;
  plan_type: string;
}> = {
  list: GetAllPlansList,
};

export const clientLoginListApiObject: ListApiObject<{
  id: number;
  username: string;
  email: string;
  role: string;
}> = {
  list: GetAllClientLoginList,
};

export const parentModulesListApiObject: ListApiObject<{
  id: number;
  module_name: string;
  status?: string;
  project_name?: string | null;
}> = {
  list: GetAllParentModulesList,
};

export const projectRoleListApiObject: ListApiObject<{
  id: number;
  code: string;
  role_name: string;
  status?: string;
}> = {
  list: GetAllProjectRolesList,
};

/** Role Master rows scoped to one project (roles_master.project_ids). */
export function createRoleListByProjectApiObject(
  projectId: number
): ListApiObject<{
  id: number;
  role_code: string;
  role_name: string;
  status?: string;
}> {
  return {
    list: async () => {
      const result = await GetRolesByProjectId(projectId);
      const rows = result?.rows ?? [];
      return { rows, total: result?.total ?? rows.length };
    },
  };
}

export const rolesListApiObject: ListApiObject<{
  id: number;
  role_code: string;
  role_name: string;
}> = {
  list: GetAllRolesList,
};

export const paymentTypeListApiObject: ListApiObject<{
  id: number;
  type: string;
  status?: string;
}> = {
  list: GetAllPaymentTypesList,
};

export const restaurantListApiObject: ListApiObject<{
  id: number;
  restaurant_name: string;
  restaurant_mobile?: string | null;
  status?: string;
}> = {
  list: GetAllRestaurantsList,
};

export const clientManagementListApiObject: ListApiObject<{
  id: number;
  restaurant_name?: string | null;
  owner_name?: string | null;
  mobile?: string | null;
}> = {
  list: (body) =>
    GetAllClientManagementList(body as ListQueryPayload | undefined),
};
