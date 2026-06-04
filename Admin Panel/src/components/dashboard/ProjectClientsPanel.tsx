"use client";

import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateDisplayIST } from "@/utils/format-date";
import { formatINR } from "@/lib/format-currency";
import type { ClientManagementRow } from "@/types/client-management.types";

interface ProjectClientsPanelProps {
  clients: ClientManagementRow[];
  loading?: boolean;
  projectName: string;
}

export function ProjectClientsPanel({
  clients,
  loading,
  projectName,
}: ProjectClientsPanelProps) {
  return (
    <div className="dashboard-panel rounded-2xl border border-border/80 bg-card p-5 shadow-sm ring-1 ring-border/40">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-base font-semibold text-foreground">
            Project clients
          </h3>
          <p className="text-sm text-muted-foreground">
            Clients linked to {projectName}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/client-management" />}
          className="gap-1"
        >
          View all
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Loading clients...
        </p>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-12 text-center">
          <Building2 className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-foreground">No clients yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add clients with this project selected in Client Management.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {clients.slice(0, 12).map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium">
                    {c.company_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.owner_name || "—"}
                  </td>
                  <td className="px-4 py-3">{c.plan_type || "—"}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                    {formatINR(c.plan_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        String(c.plan_status).toLowerCase() === "active"
                          ? "default"
                          : "secondary"
                      }
                      className="capitalize"
                    >
                      {c.plan_status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {formatDateDisplayIST(c.created_at) || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clients.length > 12 && (
            <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
              Showing 12 of {clients.length} clients
            </p>
          )}
        </div>
      )}
    </div>
  );
}
