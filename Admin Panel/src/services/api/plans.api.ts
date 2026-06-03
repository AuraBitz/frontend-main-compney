import Http from "@/services/api/http";

export const GetAllPlansList = (body?: unknown) => {
  return Http.post({
    url: "/plans/list",
    data: body,
  });
};

export const CreatePlan = (body?: unknown) => {
  return Http.post({
    url: "/plans",
    data: body,
    messageSettings: { successMessage: "Plan created successfully." },
  });
};

export const UpdatePlan = (id: string | number, body?: unknown) => {
  return Http.patch({
    url: `/plans/${id}`,
    data: body,
    messageSettings: { successMessage: "Plan updated successfully." },
  });
};

export const DeletePlan = (id: string | number) => {
  return Http.delete({
    url: `/plans/${id}`,
    messageSettings: { successMessage: "Plan deleted successfully." },
  });
};
