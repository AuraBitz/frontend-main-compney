import Http from "@/services/api/http";
import type { ListQueryPayload } from "@/lib/filter-builder-v2";
import { defaultListQuery } from "@/lib/list-query";
import type { RestaurantTableRow } from "@/types/restaurant-ops.types";

export const GetRestaurantTableById = (id: string | number) =>
  Http.get<RestaurantTableRow>({
    url: `/restaurant-table-master/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });

export const GetAllRestaurantTablesList = (body?: ListQueryPayload) =>
  Http.postList<RestaurantTableRow>({
    url: "/restaurant-table-master/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });

export const CreateRestaurantTable = (body?: unknown) =>
  Http.post({
    url: "/restaurant-table-master",
    data: body,
    messageSettings: { successMessage: "Table created successfully." },
  });

export const UpdateRestaurantTable = (id: string | number, body?: unknown) =>
  Http.patch({
    url: `/restaurant-table-master/${id}`,
    data: body,
    messageSettings: { successMessage: "Table updated successfully." },
  });

export const DeleteRestaurantTable = (id: string | number) =>
  Http.delete({
    url: `/restaurant-table-master/${id}`,
    messageSettings: { successMessage: "Table deleted successfully." },
  });
