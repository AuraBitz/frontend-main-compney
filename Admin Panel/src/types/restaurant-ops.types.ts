export type MenuAvailableStatus = "available" | "not_available";

export interface MenuItemRow {
  id: number;
  name: string;
  amount: number;
  image?: string | null;
  available_status?: MenuAvailableStatus;
}

export interface MenuCategoryRow {
  id: number;
  title: string;
  items: MenuItemRow[];
  available_status?: MenuAvailableStatus;
}

export interface RestaurantMenuRow {
  id: number;
  restaurant_id: number;
  restaurant_thali_name: string;
  thali_image?: string | null;
  menu_items: MenuCategoryRow[];
  created_at?: string;
  restaurant_name?: string | null;
}

export interface RestaurantCustomerRow {
  id: number;
  restaurant_id: number;
  customer_name: string;
  email?: string | null;
  phone?: string | null;
  customer_login_id?: number | null;
  is_not_login?: boolean;
  current_status?: string;
  address?: string | null;
  created_at?: string;
  restaurant_name?: string | null;
}

export interface RestaurantFloorRow {
  id: number;
  restaurant_id: number;
  floor_no: number;
  created_at?: string;
  restaurant_name?: string | null;
}

export interface RestaurantTableRow {
  id: number;
  restaurant_id: number;
  floor_id: number;
  table_number: string;
  chair_count: number;
  booking_status: string;
  created_at?: string;
  restaurant_name?: string | null;
  floor_no?: number | null;
}

export interface RestaurantTransactionRow {
  id: number;
  customer_id: number;
  account_number?: string | null;
  bank_name?: string | null;
  transaction_at?: string | null;
  transaction_by?: string | null;
  created_at?: string;
  customer_name?: string | null;
  restaurant_id?: number | null;
  restaurant_name?: string | null;
}

export interface RestaurantOrderRow {
  id: number;
  table_id?: number | null;
  restaurant_id: number;
  menu_id?: number[];
  item_id?: number[];
  amount: number;
  status: string;
  customer_transaction_id?: number | null;
  created_at?: string;
  restaurant_name?: string | null;
  table_number?: string | null;
}

export type RestaurantOrderMasterStatus = "pending" | "on_dine" | "completed";

export interface RestaurantOrderMasterRow {
  id: number;
  order_number: number;
  customer_id?: number | null;
  floor_id?: number | null;
  table_id?: number | null;
  restaurant_id: number;
  order_items_id?: number[];
  status: RestaurantOrderMasterStatus | string;
  created_at?: string;
  restaurant_name?: string | null;
  customer_name?: string | null;
  floor_no?: string | null;
  table_number?: string | null;
}

export interface RestaurantPaymentRow {
  id: number;
  order_id: number;
  transaction_id?: number | null;
  is_cash_amount: boolean;
  amount: number;
  payment_at?: string | null;
  created_at?: string;
  restaurant_id?: number | null;
  restaurant_name?: string | null;
}

export interface RestaurantBookingRow {
  id: number;
  customer_id?: number | null;
  restaurant_id: number;
  customer_name?: string | null;
  customer_phone?: string | null;
  booking_time?: string | null;
  booking_date?: string | null;
  booking_status?: string | null;
  is_manual_booking?: boolean;
  persons_count: number;
  table_id?: number | null;
  created_at?: string;
  restaurant_name?: string | null;
  table_number?: string | null;
  floor_id?: number | null;
  floor_no?: number | null;
}
