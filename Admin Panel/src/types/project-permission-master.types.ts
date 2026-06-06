export interface ProjectPermissionMasterRow {
  id: number;
  role_ids: number[];
  role_names?: string | null;
  project_ids: number[];
  overall_access: boolean;
  created_at: string;
}

export interface ProjectAccessPayload {
  accessType: "management" | "project";
  projectRoleId: number | null;
  overallAccess: boolean;
  projectIds: number[];
}
