import Http from "@/services/api/http";
import type { ListQueryPayload } from "@/lib/filter-builder-v2";
import { defaultListQuery } from "@/lib/list-query";
import type { RestaurantTransactionRow } from "@/types/restaurant-ops.types";

export const GetRestaurantTransactionById = (id: string | number) =>
  Http.get<RestaurantTransactionRow>({
    url: `/restaurant-transaction-master/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });

export const GetAllRestaurantTransactionsList = (body?: ListQueryPayload) =>
  Http.postList<RestaurantTransactionRow>({
    url: "/restaurant-transaction-master/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });

export const CreateRestaurantTransaction = (body?: unknown) =>
  Http.post({
    url: "/restaurant-transaction-master",
    data: body,
    messageSettings: { successMessage: "Transaction created successfully." },
  });

export const UpdateRestaurantTransaction = (id: string | number, body?: unknown) =>
  Http.patch({
    url: `/restaurant-transaction-master/${id}`,
    data: body,
    messageSettings: { successMessage: "Transaction updated successfully." },
  });
