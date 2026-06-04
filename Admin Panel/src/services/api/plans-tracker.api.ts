import Http from "@/services/api/http";
import type { PlansTrackerRow } from "@/types/plans-tracker.types";
import type { ListQueryPayload } from "@/lib/filter-builder-v2";

export interface PlanPurchasePayload {
  client_login_id: number;
  plan_id: number;
  purchase_at?: string;
}

export const GetAllPlansTrackerList = (body?: ListQueryPayload) => {
  return Http.postList<PlansTrackerRow>({
    url: "/plans-tracker/list",
    data: body,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const PurchasePlanGetPlan = (body: PlanPurchasePayload) => {
  return Http.post<unknown>({
    url: "/plans-tracker/get-plan",
    data: body,
  });
};
