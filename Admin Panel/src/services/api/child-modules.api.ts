import Http from "@/services/api/http";
import { defaultListQuery } from "@/lib/list-query";

export interface ChildModuleRow {
  id: number;
  parent_module_id: number;
  parent_module_name?: string | null;
  child_module_name: string;
  created_at?: string;
  created_by?: number | null;
  created_by_name?: string | null;
}

export const GetChildModuleById = (id: string | number) => {
  return Http.get<ChildModuleRow>({
    url: `/child-modules/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const GetAllChildModulesList = (body?: unknown) => {
  return Http.postList<ChildModuleRow>({
    url: "/child-modules/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const CreateChildModule = (body?: unknown) => {
  return Http.post({
    url: "/child-modules",
    data: body,
    messageSettings: { successMessage: "Child module created successfully." },
  });
};

export const UpdateChildModule = (id: string | number, body?: unknown) => {
  return Http.patch({
    url: `/child-modules/${id}`,
    data: body,
    messageSettings: { successMessage: "Child module updated successfully." },
  });
};

export const DeleteChildModule = (id: string | number) => {
  return Http.delete({
    url: `/child-modules/${id}`,
    messageSettings: { successMessage: "Child module deleted successfully." },
  });
};
