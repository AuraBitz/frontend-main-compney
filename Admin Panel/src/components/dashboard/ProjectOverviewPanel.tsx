"use client";

import Link from "next/link";
import { FolderKanban, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectDashboardStats } from "@/lib/dashboard-amount-utils";
import { formatINR } from "@/lib/format-currency";

interface ProjectOverviewPanelProps {
  rows: ProjectDashboardStats[];
  loading?: boolean;
}

export function ProjectOverviewPanel({
  rows,
  loading,
}: ProjectOverviewPanelProps) {
  const totals = rows.reduce(
    (acc, r) => ({
      clients: acc.clients + r.clientCount,
      users: acc.users + r.userCount,
      earnings: acc.earnings + r.earnings,
    }),
    { clients: 0, users: 0, earnings: 0 }
  );

  return (
    <div className="dashboard-panel rounded-2xl border border-border/80 bg-card p-5 shadow-sm ring-1 ring-border/40">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-base font-semibold text-foreground">
            Project-wise overview
          </h3>
          <p className="text-sm text-muted-foreground">
            Clients, login users and earnings per project in selected range
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/projects" />}
          className="gap-1"
        >
          <FolderKanban className="size-4" />
          Projects
        </Button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Loading project stats...
        </p>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No projects found
        </p>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-center">
              <p className="text-lg font-bold tabular-nums">{totals.clients}</p>
              <p className="text-xs text-muted-foreground">Clients</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-center">
              <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {totals.users}
              </p>
              <p className="text-xs text-muted-foreground">Users</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-center">
              <p className="text-lg font-bold tabular-nums text-primary">
                {formatINR(totals.earnings)}
              </p>
              <p className="text-xs text-muted-foreground">Earnings</p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3 text-right">Clients</th>
                  <th className="px-4 py-3 text-right">Users</th>
                  <th className="px-4 py-3 text-right">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.projectId}
                    className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {row.projectName}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {row.clientCount}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center justify-end gap-1 tabular-nums">
                        <Users className="size-3.5 text-muted-foreground" />
                        {row.userCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-primary">
                      {formatINR(row.earnings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
