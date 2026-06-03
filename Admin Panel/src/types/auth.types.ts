export type Role = "super_admin" | "admin" | "manager" | "viewer";

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
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: SessionUser;
  token: string;
}
