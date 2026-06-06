export interface EmployeeMasterRow {
  id: number;
  emp_code: string;
  employee_name: string;
  mobile?: string | null;
  email?: string | null;
  address?: string | null;
  /** FK -> project_role_master.id (login redirect via project_permission_master) */
  emp_role: number;
  /** FK -> roles_master.id (Role Master — project assignment) */
  role_master_id?: number | null;
  project_role_id?: number | null;
  project_role_name?: string | null;
  project_role_code?: string | null;
  /** Live from project_permission via emp_role */
  project_id?: number | null;
  project_ids?: number[];
  project_name?: string | null;
  /** @deprecated use project_role_name */
  emp_role_name?: string | null;
  /** @deprecated use project_role_code */
  emp_role_code?: string | null;
  status: string;
  emp_login_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeLoginRow {
  id: number;
  created_at: string;
}
