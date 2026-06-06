import Http from "@/services/api/http";
import type { ListQueryPayload } from "@/lib/filter-builder-v2";
import { defaultListQuery } from "@/lib/list-query";
import type { RestaurantBookingRow } from "@/types/restaurant-ops.types";

export const GetRestaurantBookingById = (id: string | number) =>
  Http.get<RestaurantBookingRow>({
    url: `/restaurant-booking-master/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });

export const GetAllRestaurantBookingsList = (body?: ListQueryPayload) =>
  Http.postList<RestaurantBookingRow>({
    url: "/restaurant-booking-master/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });

export const CreateRestaurantBooking = (body?: unknown) =>
  Http.post({
    url: "/restaurant-booking-master",
    data: body,
    messageSettings: { successMessage: "Booking created successfully." },
  });

export const UpdateRestaurantBooking = (id: string | number, body?: unknown) =>
  Http.patch({
    url: `/restaurant-booking-master/${id}`,
    data: body,
    messageSettings: { successMessage: "Booking updated successfully." },
  });
