import Http from "@/services/api/http";
import type { ListQueryPayload } from "@/lib/filter-builder-v2";
import { defaultListQuery } from "@/lib/list-query";
import type { RestaurantOrderMasterRow } from "@/types/restaurant-ops.types";

export const GetRestaurantOrderMasterById = (id: string | number) =>
  Http.get<RestaurantOrderMasterRow>({
    url: `/restaurant-order-master/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });

export const GetAllRestaurantOrderMasterList = (body?: ListQueryPayload) =>
  Http.postList<RestaurantOrderMasterRow>({
    url: "/restaurant-order-master/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });

export const CreateRestaurantOrderMaster = (body?: unknown) =>
  Http.post({
    url: "/restaurant-order-master",
    data: body,
    messageSettings: { successMessage: "Order created successfully." },
  });

export const UpdateRestaurantOrderMaster = (id: string | number, body?: unknown) =>
  Http.patch({
    url: `/restaurant-order-master/${id}`,
    data: body,
    messageSettings: { successMessage: "Order updated successfully." },
  });

export const DeleteRestaurantOrderMaster = (id: string | number) =>
  Http.delete({
    url: `/restaurant-order-master/${id}`,
    messageSettings: { successMessage: "Order deleted successfully." },
  });
