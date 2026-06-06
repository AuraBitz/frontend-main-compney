export type PermissionActionKey =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "download";

export type ModulePermissionFlags = Record<PermissionActionKey, boolean>;

export type ModulesPermissionMap = Record<string, ModulePermissionFlags>;

export interface PermissionChildModuleRow {
  key: string;
  label: string;
}

export interface PermissionModuleGroup {
  key: string;
  label: string;
  children: PermissionChildModuleRow[];
}

/** @deprecated Use PermissionModuleGroup — kept for flat helpers */
export interface PermissionModuleRow {
  key: string;
  label: string;
}

export interface PermissionMasterRow {
  id: number;
  role_id: number;
  role_name?: string | null;
  role_code?: string | null;
  modules: ModulesPermissionMap;
  created_at?: string;
}

export const PERMISSION_ACTIONS: {
  key: PermissionActionKey;
  label: string;
}[] = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
  { key: "download", label: "Download" },
];
