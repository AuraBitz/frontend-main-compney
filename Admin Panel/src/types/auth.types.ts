export type Role = "super_admin" | "admin" | "manager" | "viewer";

export type AccessType = "management" | "project";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "inactive";
  lastLogin?: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  accessType: AccessType;
  /** project_role_master — login redirect */
  projectRoleId?: number | null;
  projectRoleName?: string | null;
  /** roles_master — permission_master module access in project portal */
  roleMasterId?: number | null;
  roleMasterName?: string | null;
  overallAccess?: boolean;
  allowedProjectIds?: number[];
  /** Client login (restaurant owner) */
  isClientLogin?: boolean;
  restaurantId?: number | null;
  restaurantName?: string | null;
  ownerName?: string | null;
  planId?: number | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: SessionUser;
  token: string;
}
