import Http from "@/services/api/http";

export const GetAllProjectsList = (body?: unknown) => {
  return Http.post({
    url: "/projects/list",
    data: body,
  });
};

export const CreateProject = (body?: unknown) => {
  return Http.post({
    url: "/projects",
    data: body,
    messageSettings: { successMessage: "Project created successfully." },
  });
};

export const UpdateProject = (id: string | number, body?: unknown) => {
  return Http.patch({
    url: `/projects/${id}`,
    data: body,
    messageSettings: { successMessage: "Project updated successfully." },
  });
};

export const DeleteProject = (id: string | number) => {
  return Http.delete({
    url: `/projects/${id}`,
    messageSettings: { successMessage: "Project deleted successfully." },
  });
};
