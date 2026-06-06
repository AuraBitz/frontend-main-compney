import Http from "@/services/api/http";
import type { ListQueryPayload } from "@/lib/filter-builder-v2";
import { defaultListQuery } from "@/lib/list-query";
import type { RestaurantMenuRow } from "@/types/restaurant-ops.types";

export const GetRestaurantMenuById = (id: string | number) => {
  return Http.get<RestaurantMenuRow>({
    url: `/restaurant-menu-master/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const GetAllRestaurantMenusList = (body?: ListQueryPayload) => {
  return Http.postList<RestaurantMenuRow>({
    url: "/restaurant-menu-master/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const CreateRestaurantMenu = (body?: unknown) => {
  return Http.post({
    url: "/restaurant-menu-master",
    data: body,
    messageSettings: { successMessage: "Menu created successfully." },
  });
};

export const UpdateRestaurantMenu = (id: string | number, body?: unknown) => {
  return Http.patch({
    url: `/restaurant-menu-master/${id}`,
    data: body,
    messageSettings: { successMessage: "Menu updated successfully." },
  });
};

export const DeleteRestaurantMenu = (id: string | number) => {
  return Http.delete({
    url: `/restaurant-menu-master/${id}`,
    messageSettings: { successMessage: "Menu deleted successfully." },
  });
};
