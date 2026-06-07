import Http from "@/services/api/http";

export interface RestaurantCallWaiterRow {
  id: number;
  restaurant_id: number;
  floor_id: number;
  table_id: number;
  is_ring: boolean;
  ring_count: number;
  calling_text?: Record<string, string> | string | null;
  created_at: string;
  updated_at?: string;
  restaurant_name?: string | null;
  floor_no?: number | null;
  table_number?: string | null;
}

export const GetRecentRestaurantCallWaiter = (
  restaurantId: number,
  minutes = 30
) =>
  Http.get<RestaurantCallWaiterRow[]>({
    url: `/restaurant-call-waiter/by-restaurant/${restaurantId}?minutes=${minutes}`,
    messageSettings: { hideSuccessMessage: true, hideErrorMessage: true },
  });
