import Http from "@/services/api/http";
import type { ListQueryPayload } from "@/lib/filter-builder-v2";
import { defaultListQuery } from "@/lib/list-query";
import type { RestaurantPaymentRow } from "@/types/restaurant-ops.types";

export const GetRestaurantPaymentById = (id: string | number) =>
  Http.get<RestaurantPaymentRow>({
    url: `/restaurant-payment-master/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });

export const GetAllRestaurantPaymentsList = (body?: ListQueryPayload) =>
  Http.postList<RestaurantPaymentRow>({
    url: "/restaurant-payment-master/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });

export const CreateRestaurantPayment = (body?: unknown) =>
  Http.post({
    url: "/restaurant-payment-master",
    data: body,
    messageSettings: { successMessage: "Payment created successfully." },
  });

export const UpdateRestaurantPayment = (id: string | number, body?: unknown) =>
  Http.patch({
    url: `/restaurant-payment-master/${id}`,
    data: body,
    messageSettings: { successMessage: "Payment updated successfully." },
  });
