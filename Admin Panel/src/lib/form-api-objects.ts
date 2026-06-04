import { GetAllClientLoginList } from "@/services/api/client-login.api";
import { GetAllParentModulesList } from "@/services/api/parent-modules.api";
import { GetAllPlansList } from "@/services/api/plans.api";
import { GetAllProjectsList } from "@/services/api/projects.api";
import { GetAllRolesList } from "@/services/api/roles.api";
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
}> = {
  list: GetAllParentModulesList,
};

export const rolesListApiObject: ListApiObject<{
  id: number;
  role_code: string;
  role_name: string;
}> = {
  list: GetAllRolesList,
};
