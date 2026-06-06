import Http from "@/services/api/http";
import type { ListQueryPayload } from "@/lib/filter-builder-v2";
import { defaultListQuery } from "@/lib/list-query";
import type { RestaurantCustomerRow } from "@/types/restaurant-ops.types";

export const GetRestaurantCustomerById = (id: string | number) => {
  return Http.get<RestaurantCustomerRow>({
    url: `/restaurant-customer-management/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const GetAllRestaurantCustomersList = (body?: ListQueryPayload) => {
  return Http.postList<RestaurantCustomerRow>({
    url: "/restaurant-customer-management/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });
};
