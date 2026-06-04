export interface PlansTrackerRow {
  id?: number;
  client_login_id?: number;
  purchase_at: string;
  plan_id?: number;
  client_name?: string | null;
  username?: string | null;
  plan_type?: string | null;
  plan_amount?: number | string | null;
  plan_validity?: number | null;
}
