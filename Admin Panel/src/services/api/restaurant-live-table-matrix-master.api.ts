import Http from "@/services/api/http";
import type { ListQueryPayload } from "@/lib/filter-builder-v2";
import { defaultListQuery } from "@/lib/list-query";
import type { LiveTablesPersisted } from "@/restaurant-management-admin-panel/lib/live-tables-storage";

export interface RestaurantLiveTableMatrixRow {
  id: number;
  restaurant_id: number;
  matrix: LiveTablesPersisted;
  created_at?: string;
  updated_at?: string;
  restaurant_name?: string;
}

export const GetRestaurantLiveTableMatrixByRestaurantId = (
  restaurantId: string | number
) =>
  Http.get<RestaurantLiveTableMatrixRow | null>({
    url: `/restaurant-live-table-matrix-master/by-restaurant/${restaurantId}`,
    messageSettings: { hideSuccessMessage: true },
  });

export const UpsertRestaurantLiveTableMatrix = (
  restaurantId: string | number,
  matrix: LiveTablesPersisted
) =>
  Http.put<RestaurantLiveTableMatrixRow>({
    url: `/restaurant-live-table-matrix-master/by-restaurant/${restaurantId}`,
    data: { matrix },
    messageSettings: { hideSuccessMessage: true },
  });

export const GetAllRestaurantLiveTableMatrixList = (body?: ListQueryPayload) =>
  Http.postList<RestaurantLiveTableMatrixRow>({
    url: "/restaurant-live-table-matrix-master/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });
