import Http from "@/services/api/http";
import type { ListQueryPayload } from "@/lib/filter-builder-v2";
import { defaultListQuery } from "@/lib/list-query";
import type { RestaurantOrderRow } from "@/types/restaurant-ops.types";

export const GetAllRestaurantOrdersList = (body?: ListQueryPayload) =>
  Http.postList<RestaurantOrderRow>({
    url: "/restaurant-order-management/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });
