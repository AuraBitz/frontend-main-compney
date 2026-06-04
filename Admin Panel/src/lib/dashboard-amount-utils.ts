import type { ChartPoint } from "@/lib/dashboard-utils";

export interface PlanAmountRow {
  plan_type?: string | null;
  plan_amount?: number | string | null;
  project_id?: number | null;
  project_name?: string | null;
  login_id?: number | null;
}

export interface ProjectDashboardStats {
  projectId: number;
  projectName: string;
  clientCount: number;
  userCount: number;
  earnings: number;
}

/** Sum plan amounts grouped by plan type (for bar chart) */
export function groupAmountByPlanType(items: PlanAmountRow[]): ChartPoint[] {
  const map = new Map<string, number>();

  for (const item of items) {
    const label = String(item.plan_type ?? "").trim() || "No plan";
    const amount = Number(item.plan_amount);
    if (!Number.isFinite(amount) || amount <= 0) continue;
    map.set(label, (map.get(label) ?? 0) + amount);
  }

  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function sumPlanAmounts(items: PlanAmountRow[]): number {
  return items.reduce((sum, item) => {
    const amount = Number(item.plan_amount);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);
}

function accumulateProjectStats(clients: PlanAmountRow[]) {
  const map = new Map<
    number,
    ProjectDashboardStats & { loginIds: Set<number> }
  >();

  for (const client of clients) {
    const projectId =
      client.project_id != null && Number.isFinite(Number(client.project_id))
        ? Number(client.project_id)
        : 0;
    const projectName =
      String(client.project_name ?? "").trim() ||
      (projectId === 0 ? "Unassigned" : `Project #${projectId}`);

    let row = map.get(projectId);
    if (!row) {
      row = {
        projectId,
        projectName,
        clientCount: 0,
        userCount: 0,
        earnings: 0,
        loginIds: new Set(),
      };
      map.set(projectId, row);
    }

    row.clientCount += 1;
    const amount = Number(client.plan_amount);
    if (Number.isFinite(amount)) {
      row.earnings += amount;
    }
    if (client.login_id != null && Number.isFinite(Number(client.login_id))) {
      row.loginIds.add(Number(client.login_id));
    }
  }

  return map;
}

/** Per-project clients, users (distinct logins), earnings from client rows */
export function buildProjectStatsFromClients(
  clients: PlanAmountRow[]
): ProjectDashboardStats[] {
  return Array.from(accumulateProjectStats(clients).values())
    .map(({ loginIds, ...row }) => ({
      ...row,
      userCount: loginIds.size,
    }))
    .sort((a, b) => b.earnings - a.earnings || b.clientCount - a.clientCount);
}

/** Merge registered projects with stats; include unassigned when present */
export function buildMainAdminProjectStats(
  projects: { id: number; name: string }[],
  clientsInRange: PlanAmountRow[]
): ProjectDashboardStats[] {
  const map = accumulateProjectStats(clientsInRange);
  const rows: ProjectDashboardStats[] = projects.map((p) => {
    const existing = map.get(p.id);
    if (existing) {
      const { loginIds, ...rest } = existing;
      return { ...rest, userCount: loginIds.size };
    }
    return {
      projectId: p.id,
      projectName: p.name,
      clientCount: 0,
      userCount: 0,
      earnings: 0,
    };
  });

  const unassigned = map.get(0);
  if (unassigned && unassigned.clientCount > 0) {
    const { loginIds, ...rest } = unassigned;
    rows.push({ ...rest, userCount: loginIds.size });
  }

  return rows.sort(
    (a, b) => b.earnings - a.earnings || b.clientCount - a.clientCount
  );
}

export function projectStatsToChartData(
  stats: ProjectDashboardStats[]
): ChartPoint[] {
  return stats
    .filter((s) => s.earnings > 0)
    .map((s) => ({
      label: s.projectName,
      count: s.earnings,
    }));
}
