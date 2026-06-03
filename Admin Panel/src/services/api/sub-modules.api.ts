import Http from "@/services/api/http";

export const GetAllSubModulesList = (body?: unknown) => {
  return Http.post({
    url: "/sub-modules/list",
    data: body,
  });
};

export const CreateSubModule = (body?: unknown) => {
  return Http.post({
    url: "/sub-modules",
    data: body,
    messageSettings: { successMessage: "Sub module created successfully." },
  });
};

export const UpdateSubModule = (id: string | number, body?: unknown) => {
  return Http.patch({
    url: `/sub-modules/${id}`,
    data: body,
    messageSettings: { successMessage: "Sub module updated successfully." },
  });
};

export const DeleteSubModule = (id: string | number) => {
  return Http.delete({
    url: `/sub-modules/${id}`,
    messageSettings: { successMessage: "Sub module deleted successfully." },
  });
};
