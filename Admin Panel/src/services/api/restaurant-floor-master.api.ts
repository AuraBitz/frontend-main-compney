import Http from "@/services/api/http";
import type { ListQueryPayload } from "@/lib/filter-builder-v2";
import { defaultListQuery } from "@/lib/list-query";
import type { RestaurantFloorRow } from "@/types/restaurant-ops.types";

export const GetRestaurantFloorById = (id: string | number) =>
  Http.get<RestaurantFloorRow>({
    url: `/restaurant-floor-master/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });

export const GetAllRestaurantFloorsList = (body?: ListQueryPayload) =>
  Http.postList<RestaurantFloorRow>({
    url: "/restaurant-floor-master/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });

export const CreateRestaurantFloor = (body?: unknown) =>
  Http.post({
    url: "/restaurant-floor-master",
    data: body,
    messageSettings: { successMessage: "Floor created successfully." },
  });

export const UpdateRestaurantFloor = (id: string | number, body?: unknown) =>
  Http.patch({
    url: `/restaurant-floor-master/${id}`,
    data: body,
    messageSettings: { successMessage: "Floor updated successfully." },
  });
