"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CreditCard,
  FolderKanban,
  IndianRupee,
  LayoutDashboard,
  Sparkles,
  Users,
} from "lucide-react";
import { ClientsChart } from "@/components/dashboard/ClientsChart";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import {
  DateRangeFilter,
  type DateRangeValue,
} from "@/components/dashboard/DateRangeFilter";
import { PlanAmountChart } from "@/components/dashboard/PlanAmountChart";
import { ProjectOverviewPanel } from "@/components/dashboard/ProjectOverviewPanel";
import { ProjectsChart } from "@/components/dashboard/ProjectsChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { UsersPanel } from "@/components/dashboard/UsersPanel";
import { Button } from "@/components/ui/button";
import { GetAllClientManagementList } from "@/services/api/client-management.api";
import { GetAllClientLoginList } from "@/services/api/client-login.api";
import { GetAllPlansList } from "@/services/api/plans.api";
import { GetAllProjectsList } from "@/services/api/projects.api";
import type { BackendLoginAccount } from "@/services/api/login.api";
import type { ClientManagementRow } from "@/types/client-management.types";
import {
  defaultDateRange,
  groupByDay,
  isWithinDateRange,
  parseEndDate,
  parseStartDate,
  type ChartPoint,
} from "@/lib/dashboard-utils";
import {
  buildMainAdminProjectStats,
  projectStatsToChartData,
  sumPlanAmounts,
} from "@/lib/dashboard-amount-utils";
import { formatINR } from "@/lib/format-currency";
import { defaultListQuery } from "@/lib/list-query";

interface ProjectRow {
  id: number;
  name: string;
  status?: string;
  project_start_at?: string | null;
}

const quickLinks = [
  { href: "/client-management", label: "Clients", icon: Building2 },
  { href: "/plans", label: "Plan Master", icon: CreditCard },
  { href: "/projects", label: "Project Master", icon: FolderKanban },
  { href: "/projects/check", label: "Check Project", icon: LayoutDashboard },
] as const;

export function MainDashboardView() {
  const [dateRange, setDateRange] = useState<DateRangeValue>(defaultDateRange);
  const [appliedRange, setAppliedRange] = useState<DateRangeValue>(
    defaultDateRange
  );
  const [clients, setClients] = useState<ClientManagementRow[]>([]);
  const [users, setUsers] = useState<BackendLoginAccount[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [plansCount, setPlansCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (range: DateRangeValue) => {
    setLoading(true);
    setError("");
    try {
      const [clientData, userData, planData, projectData] = await Promise.all([
        GetAllClientManagementList(defaultListQuery),
        GetAllClientLoginList(defaultListQuery),
        GetAllPlansList(defaultListQuery),
        GetAllProjectsList(defaultListQuery),
      ]);

      setClients(clientData.rows);
      setUsers(userData.rows);
      setProjects(projectData.rows as ProjectRow[]);
      setPlansCount(planData.total);
      setAppliedRange(range);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard(defaultDateRange());
  }, [loadDashboard]);

  const startDate = useMemo(
    () => parseStartDate(appliedRange.start),
    [appliedRange.start]
  );
  const endDate = useMemo(
    () => parseEndDate(appliedRange.end),
    [appliedRange.end]
  );

  const filteredClients = useMemo(
    () =>
      clients.filter((c) =>
        isWithinDateRange(c.created_at, startDate, endDate)
      ),
    [clients, startDate, endDate]
  );

  const filteredUsers = useMemo(
    () =>
      users.filter((u) =>
        isWithinDateRange(u.created_at, startDate, endDate)
      ),
    [users, startDate, endDate]
  );

  const filteredProjects = useMemo(
    () =>
      projects.filter((p) =>
        isWithinDateRange(p.project_start_at, startDate, endDate)
      ),
    [projects, startDate, endDate]
  );

  const clientChartData = useMemo(
    () =>
      groupByDay(
        filteredClients,
        (c) => c.created_at,
        startDate,
        endDate
      ),
    [filteredClients, startDate, endDate]
  );

  const projectChartData = useMemo<ChartPoint[]>(() => {
    const active = filteredProjects.filter(
      (p) => String(p.status).toLowerCase() === "active"
    ).length;
    const inactive = filteredProjects.length - active;
    return [
      { label: "Active", count: active },
      { label: "Inactive", count: inactive },
      { label: "Total", count: filteredProjects.length },
    ];
  }, [filteredProjects]);

  const activeClients = useMemo(
    () =>
      filteredClients.filter(
        (c) => String(c.plan_status).toLowerCase() === "active"
      ).length,
    [filteredClients]
  );

  const totalEarnings = useMemo(
    () => sumPlanAmounts(filteredClients),
    [filteredClients]
  );

  const projectStats = useMemo(
    () => buildMainAdminProjectStats(projects, filteredClients),
    [projects, filteredClients]
  );

  const projectEarningsChart = useMemo(
    () => projectStatsToChartData(projectStats),
    [projectStats]
  );

  const totalProjectUsers = useMemo(() => {
    const ids = new Set<number>();
    for (const c of filteredClients) {
      if (c.login_id != null && Number.isFinite(Number(c.login_id))) {
        ids.add(Number(c.login_id));
      }
    }
    return ids.size;
  }, [filteredClients]);

  const projectByLoginId = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of filteredClients) {
      if (c.login_id == null) continue;
      const loginId = Number(c.login_id);
      if (!Number.isFinite(loginId)) continue;
      const label =
        c.project_name?.trim() ||
        (c.project_id ? `Project #${c.project_id}` : "Unassigned");
      map.set(loginId, label);
    }
    return map;
  }, [filteredClients]);

  const handleApply = () => {
    if (dateRange.start > dateRange.end) {
      setError("Start date must be before end date.");
      return;
    }
    loadDashboard(dateRange);
  };

  const handleReset = () => {
    const next = defaultDateRange();
    setDateRange(next);
    loadDashboard(next);
  };

  return (
    <div className="dashboard-page space-y-6">
      <DashboardHero
        title="Admin overview"
        subtitle="Monitor clients, users, plans and projects across your organization in one place."
        badge="Compney Admin"
        actions={
          <DateRangeFilter
            compact
            value={dateRange}
            onChange={setDateRange}
            onApply={handleApply}
            onReset={handleReset}
          />
        }
      />

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Clients"
          value={filteredClients.length}
          hint={`${activeClients} active in range`}
          icon={Building2}
          accent="primary"
          loading={loading}
        />
        <StatCard
          label="Total earnings"
          value={loading ? "—" : formatINR(totalEarnings)}
          hint="Plan amount in date range"
          icon={IndianRupee}
          accent="emerald"
          loading={loading}
        />
        <StatCard
          label="Users"
          value={filteredUsers.length}
          hint={`${totalProjectUsers} linked to projects`}
          icon={Users}
          accent="emerald"
          loading={loading}
        />
        <StatCard
          label="Plan Master"
          value={plansCount}
          hint="All subscription plans"
          icon={CreditCard}
          accent="violet"
          loading={loading}
        />
        <StatCard
          label="Projects"
          value={filteredProjects.length}
          hint={`${projects.length} total registered`}
          icon={FolderKanban}
          accent="amber"
          loading={loading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="dashboard-quick-link group flex items-center justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-sm ring-1 ring-border/40 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Icon className="size-5" />
                </span>
                <span className="font-medium text-foreground">{link.label}</span>
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <PlanAmountChart
            data={projectEarningsChart}
            loading={loading}
            totalAmount={totalEarnings}
            title="Earnings by project"
            description="Total plan amount from clients per project in selected range"
            emptyMessage="No earnings in this date range"
          />
          <ProjectOverviewPanel rows={projectStats} loading={loading} />
          <ClientsChart data={clientChartData} loading={loading} />
          <ProjectsChart data={projectChartData} loading={loading} />
        </div>
        <div className="space-y-6">
          <div className="dashboard-insight rounded-2xl border border-primary/20 bg-linear-to-br from-primary/8 via-card to-card p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Sparkles className="size-5" />
              </span>
              <div>
                <p className="font-heading text-sm font-semibold text-foreground">
                  Project portals
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Open a project from Project Master → Check Project to see a
                  dedicated dashboard and module sidebar.
                </p>
                <Button
                  className="mt-3 h-9"
                  size="sm"
                  render={<Link href="/projects/check" />}
                >
                  Check Project
                </Button>
              </div>
            </div>
          </div>
          <UsersPanel
            users={filteredUsers}
            loading={loading}
            projectByLoginId={projectByLoginId}
          />
        </div>
      </div>
    </div>
  );
}
