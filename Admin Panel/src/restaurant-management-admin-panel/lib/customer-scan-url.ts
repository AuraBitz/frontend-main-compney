export interface CustomerScanParams {
  restaurantId: number;
  customerId: number;
  tableId: number;
  bookingId: number;
}

export function buildCustomerScanUrl(params: CustomerScanParams): string {
  const base =
    process.env.NEXT_PUBLIC_CUSTOMER_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3001";

  const search = new URLSearchParams({
    restaurant_id: String(params.restaurantId),
    customer_id: String(params.customerId),
    table_id: String(params.tableId),
    booking_id: String(params.bookingId),
  });

  return `${base}/scan?${search.toString()}`;
}
