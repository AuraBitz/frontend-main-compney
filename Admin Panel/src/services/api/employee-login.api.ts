import Http from "@/services/api/http";
import { defaultListQuery } from "@/lib/list-query";
import type { EmployeeLoginRow } from "@/types/employee-master.types";

export const GetEmployeeLoginById = (id: string | number) => {
  return Http.get<EmployeeLoginRow>({
    url: `/employee-login/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const GetAllEmployeeLoginList = (body?: unknown) => {
  return Http.postList<EmployeeLoginRow>({
    url: "/employee-login/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const UpdateEmployeeLogin = (id: string | number, body?: unknown) => {
  return Http.patch({
    url: `/employee-login/${id}`,
    data: body,
    messageSettings: { successMessage: "Employee login updated successfully." },
  });
};
