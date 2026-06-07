import Http from "@/services/api/http";

export interface PlanMasterRow {
  id: number;
  plan_type: string;
  plan_valid_days: number;
  plan_modules_id: number[];
  amount: number;
  discount_amount: number;
  features?: string[];
  range_type?: "monthly" | "annually" | string;
  project_id?: number | null;
  project_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const GetPlanById = (id: string | number) => {
  return Http.get<PlanMasterRow>({
    url: `/plans/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const GetAllPlansList = (body?: unknown) => {
  return Http.postList<PlanMasterRow>({
    url: "/plans/list",
    data: body,
    messageSettings: { hideSuccessMessage: true },
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
