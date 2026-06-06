import Http from "@/services/api/http";
import { defaultListQuery } from "@/lib/list-query";
import type { EmployeeMasterRow } from "@/types/employee-master.types";

export const GetEmployeeById = (id: string | number) => {
  return Http.get<EmployeeMasterRow>({
    url: `/employee-master/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const GetAllEmployeesList = (body?: unknown) => {
  return Http.postList<EmployeeMasterRow>({
    url: "/employee-master/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const CreateEmployee = (body?: unknown) => {
  return Http.post({
    url: "/employee-master",
    data: body,
    messageSettings: { successMessage: "Employee created successfully." },
  });
};

export const UpdateEmployee = (id: string | number, body?: unknown) => {
  return Http.patch({
    url: `/employee-master/${id}`,
    data: body,
    messageSettings: { successMessage: "Employee updated successfully." },
  });
};

export const DeleteEmployee = (id: string | number) => {
  return Http.delete({
    url: `/employee-master/${id}`,
    messageSettings: { successMessage: "Employee deleted successfully." },
  });
};
