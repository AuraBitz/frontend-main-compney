import type { Role, User } from "./auth.types";

export type { User, Role };

export interface UpdateUserInput {
  name?: string;
  role?: Role;
  status?: "active" | "inactive";
}

export interface DashboardStats {
  totalProducts: number;
  activeUsers: number;
  storageUsed: string;
  activeSessions: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  user: string;
  timestamp: string;
}
