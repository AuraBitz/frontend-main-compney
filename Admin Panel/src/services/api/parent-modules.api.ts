import Http from "@/services/api/http";

export const GetAllParentModulesList = (body?: unknown) => {
  return Http.post({
    url: "/parent-modules/list",
    data: body,
  });
};

export const CreateParentModule = (body?: unknown) => {
  return Http.post({
    url: "/parent-modules",
    data: body,
    messageSettings: { successMessage: "Parent module created successfully." },
  });
};

export const UpdateParentModule = (id: string | number, body?: unknown) => {
  return Http.patch({
    url: `/parent-modules/${id}`,
    data: body,
    messageSettings: { successMessage: "Parent module updated successfully." },
  });
};

export const DeleteParentModule = (id: string | number) => {
  return Http.delete({
    url: `/parent-modules/${id}`,
    messageSettings: { successMessage: "Parent module deleted successfully." },
  });
};
