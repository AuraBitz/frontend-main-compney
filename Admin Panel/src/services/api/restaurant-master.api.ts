import Http from "@/services/api/http";
import type { ListQueryPayload } from "@/lib/filter-builder-v2";
import { defaultListQuery } from "@/lib/list-query";

export type RestaurantStatus = "online" | "offline";

export interface RestaurantMasterRow {
  id: number;
  restaurant_name: string;
  restaurant_address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  restaurant_mobile?: string | null;
  status: RestaurantStatus;
  project_id?: number | null;
  project_name?: string | null;
  created_at?: string;
  created_by?: number | null;
  created_by_name?: string | null;
  owner_name?: string | null;
  restaurant_email?: string | null;
  plan_id?: number | null;
}

export const GetRestaurantById = (id: string | number) => {
  return Http.get<RestaurantMasterRow>({
    url: `/restaurant-master/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const GetAllRestaurantsList = (body?: ListQueryPayload) => {
  return Http.postList<RestaurantMasterRow>({
    url: "/restaurant-master/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const CreateRestaurant = (body?: unknown) => {
  return Http.post({
    url: "/restaurant-master",
    data: body,
    messageSettings: { successMessage: "Restaurant created successfully." },
  });
};

export const UpdateRestaurant = (id: string | number, body?: unknown) => {
  return Http.patch({
    url: `/restaurant-master/${id}`,
    data: body,
    messageSettings: { successMessage: "Restaurant updated successfully." },
  });
};

export const DeleteRestaurant = (id: string | number) => {
  return Http.delete({
    url: `/restaurant-master/${id}`,
    messageSettings: { successMessage: "Restaurant deleted successfully." },
  });
};
