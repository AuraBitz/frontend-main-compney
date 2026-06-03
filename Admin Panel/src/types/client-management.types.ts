export type ClientPlanStatus = "Active" | "Deactivate" | "Blocked";

export interface ClientManagementRow {
  id: number;
  owner_name: string;
  mobile?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  plan_id?: number | null;
  applied_at?: string | null;
  created_at?: string | null;
  project_id?: number | null;
  plan_start_at?: string | null;
  plan_remain_days?: number | null;
  plan_status: ClientPlanStatus;
  login_id?: number | null;
}
