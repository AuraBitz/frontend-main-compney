"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CreditCard,
  IndianRupee,
  Layers,
  UserCheck,
} from "lucide-react";
import { ClientsChart } from "@/components/dashboard/ClientsChart";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import {
  DateRangeFilter,
  type DateRangeValue,
} from "@/components/dashboard/DateRangeFilter";
import { PlanAmountChart } from "@/components/dashboard/PlanAmountChart";
import { PlanStatusChart } from "@/components/dashboard/PlanStatusChart";
import { ProjectClientsPanel } from "@/components/dashboard/ProjectClientsPanel";
import { StatCard } from "@/components/dashboard/StatCard";
import { useProjectPortal } from "@/store/project-portal";
import { GetAllClientManagementList } from "@/services/api/client-management.api";
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
  groupAmountByPlanType,
  sumPlanAmounts,
} from "@/lib/dashboard-amount-utils";
import { formatINR } from "@/lib/format-currency";
import { listQueryForProject } from "@/lib/list-query";
import {
  portalChildPath,
  portalModulePath,
} from "@/restaurant-management-admin-panel/lib/portal-routes";

export function ProjectPortalDashboardView() {
  const router = useRouter();
  const { session } = useProjectPortal();
  const [dateRange, setDateRange] = useState<DateRangeValue>(defaultDateRange);
  const [appliedRange, setAppliedRange] = useState<DateRangeValue>(
    defaultDateRange
  );
  const [clients, setClients] = useState<ClientManagementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const projectId = session?.projectId ?? 0;

  const loadDashboard = useCallback(
    async (range: DateRangeValue) => {
      if (!projectId) return;
      setLoading(true);
      setError("");
      try {
        const clientData = await GetAllClientManagementList(
          listQueryForProject(projectId)
        );
        setClients(clientData.rows);
        setAppliedRange(range);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load project data"
        );
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  useEffect(() => {
    if (projectId) {
      loadDashboard(defaultDateRange());
    }
  }, [projectId, loadDashboard]);

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

  const activeClients = useMemo(
    () =>
      filteredClients.filter(
        (c) => String(c.plan_status).toLowerCase() === "active"
      ).length,
    [filteredClients]
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

  const planAmountChart = useMemo(
    () => groupAmountByPlanType(filteredClients),
    [filteredClients]
  );

  const totalPlanAmount = useMemo(
    () => sumPlanAmounts(filteredClients),
    [filteredClients]
  );

  const totalPlanAmountAll = useMemo(() => sumPlanAmounts(clients), [clients]);

  const planStatusChart = useMemo<ChartPoint[]>(() => {
    const active = filteredClients.filter(
      (c) => String(c.plan_status).toLowerCase() === "active"
    ).length;
    const deactivated = filteredClients.filter(
      (c) => String(c.plan_status).toLowerCase() === "deactivate"
    ).length;
    const blocked = filteredClients.filter(
      (c) => String(c.plan_status).toLowerCase() === "blocked"
    ).length;
    return [
      { label: "Active", count: active },
      { label: "Deactivate", count: deactivated },
      { label: "Blocked", count: blocked },
    ];
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

  if (!session) {
    return (
      <p className="text-sm text-muted-foreground">
        No project selected. Use Check Project to open a portal.
      </p>
    );
  }

  const planCount = session.planIds?.length ?? 0;
  const moduleCount =
    session.modules.length +
    session.modules.reduce((n, m) => n + (m.children?.length ?? 0), 0);

  return (
    <div className="dashboard-page dashboard-page--portal space-y-6">
      <DashboardHero
        title={`${session.projectName} dashboard`}
        subtitle={
          session.description?.trim() ||
          "Clients, plans and modules for this project only."
        }
        badge={`Project portal · ${session.status ?? "active"}`}
        className="dashboard-hero--portal"
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
          label="Project clients"
          value={clients.length}
          hint={`${activeClients} active · ${filteredClients.length} in range`}
          icon={Building2}
          accent="primary"
          loading={loading}
        />
        <StatCard
          label="Plan amount (range)"
          value={loading ? "—" : formatINR(totalPlanAmount)}
          hint={`${formatINR(totalPlanAmountAll)} total all time`}
          icon={IndianRupee}
          accent="emerald"
          loading={loading}
        />
        <StatCard
          label="Active plans"
          value={activeClients}
          hint="Clients with active plan status"
          icon={UserCheck}
          accent="emerald"
          loading={loading}
        />
        <StatCard
          label="Linked plans"
          value={planCount}
          hint="Plans in this project"
          icon={CreditCard}
          accent="violet"
          loading={loading}
        />
        <StatCard
          label="Modules"
          value={moduleCount}
          hint="Modules in sidebar"
          icon={Layers}
          accent="amber"
          loading={loading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <PlanAmountChart
            data={planAmountChart}
            loading={loading}
            totalAmount={totalPlanAmount}
          />
          <ClientsChart data={clientChartData} loading={loading} />
          <ProjectClientsPanel
            clients={clients}
            loading={loading}
            projectName={session.projectName}
          />
        </div>
        <PlanStatusChart
          data={planStatusChart}
          loading={loading}
          title="Client plan status"
          description={`Status breakdown for ${session.projectName}`}
        />
      </div>

      {session.modules.length > 0 && (
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm ring-1 ring-border/40">
          <h3 className="font-heading text-sm font-semibold text-foreground">
            Quick modules
          </h3>
          <div className="mt-3 space-y-3">
            {session.modules.map((mod) => (
              <div key={mod.id}>
                <button
                  type="button"
                  onClick={() =>
                    router.push(portalModulePath(session.projectId, mod.id))
                  }
                  className="dashboard-quick-link inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  <Layers className="size-4" />
                  {mod.name}
                </button>
                {(mod.children ?? []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 pl-4">
                    {(mod.children ?? []).map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() =>
                          router.push(
                            portalChildPath(
                              session.projectId,
                              mod.id,
                              child.id
                            )
                          )
                        }
                        className="dashboard-quick-link inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border/70 bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                      >
                        {child.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
