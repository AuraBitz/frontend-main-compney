export type ProjectMasterStatus = "active" | "inactive";

export interface ProjectMasterRow {
  id: number;
  name: string;
  description?: string | null;
  plan_ids?: number[];
  project_start_at?: string | null;
  status: ProjectMasterStatus;
  module_ids?: number[];
}
