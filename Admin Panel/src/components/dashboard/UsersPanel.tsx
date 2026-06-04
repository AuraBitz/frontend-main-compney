"use client";

import { Shield, UserCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BackendLoginAccount } from "@/services/api/login.api";

interface UsersPanelProps {
  users: BackendLoginAccount[];
  loading?: boolean;
  /** login id → project name(s) for display */
  projectByLoginId?: Map<number, string>;
}

export function UsersPanel({
  users,
  loading,
  projectByLoginId,
}: UsersPanelProps) {
  const active = users.filter(
    (u) => String(u.status).toLowerCase() === "active"
  ).length;
  const inactive = users.length - active;

  return (
    <div className="dashboard-users rounded-2xl border border-border/80 bg-card p-5 shadow-sm ring-1 ring-border/40">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-heading text-base font-semibold text-foreground">
            Users
          </h3>
          <p className="text-sm text-muted-foreground">
            Login accounts in date range
            {projectByLoginId?.size
              ? " · project shown when linked to a client"
              : ""}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Users className="size-5 text-primary" />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading users...</p>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-center">
              <p className="text-xl font-bold tabular-nums">{users.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-center">
              <p className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {active}
              </p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-center">
              <p className="text-xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
                {inactive}
              </p>
              <p className="text-xs text-muted-foreground">Other</p>
            </div>
          </div>
          <ul className="max-h-48 space-y-2 overflow-y-auto">
            {users.length === 0 ? (
              <li className="text-sm text-muted-foreground">No users in range</li>
            ) : (
              users.slice(0, 8).map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <UserCheck className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{u.username}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {u.email}
                      </p>
                      {projectByLoginId?.get(u.id) && (
                        <p className="truncate text-xs font-medium text-primary/90">
                          {projectByLoginId.get(u.id)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0 gap-1">
                    <Shield className="size-3" />
                    {u.role}
                  </Badge>
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </div>
  );
}
