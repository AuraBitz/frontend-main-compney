"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CreditCard,
  Layers,
  Mail,
  MapPin,
  Phone,
  Store,
  User,
} from "lucide-react";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { StatCard } from "@/components/dashboard/StatCard";
import { formatINR } from "@/lib/format-currency";
import { buildFilterClause } from "@/lib/filter-builder-v2";
import {
  listQueryForProject,
  listQueryForRestaurant,
} from "@/lib/list-query";
import { isClientLoginUser } from "@/lib/project-access";
import {
  portalChildPath,
  portalModulePath,
} from "@/restaurant-management-admin-panel/lib/portal-routes";
import { GetAllClientManagementList } from "@/services/api/client-management.api";
import { useAuth } from "@/store";
import { useProjectPortal } from "@/store/project-portal";
import type { ClientManagementRow } from "@/types/client-management.types";

import { formatDateDDMMYYYY } from "@/utils/format-date";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return formatDateDDMMYYYY(value) || "—";
}

export function RestaurantPortalDashboardView() {
  const router = useRouter();
  const { user } = useAuth();
  const { session } = useProjectPortal();
  const [client, setClient] = useState<ClientManagementRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const restaurantName =
    session?.restaurantName?.trim() ||
    client?.restaurant_name?.trim() ||
    "Restaurant";
  const ownerName =
    session?.ownerName?.trim() || client?.owner_name?.trim() || "Owner";

  const loadRestaurantClient = useCallback(async () => {
    if (!session?.projectId) return;

    setLoading(true);
    setError("");

    try {
      if (session.restaurantId) {
        const result = await GetAllClientManagementList(
          listQueryForRestaurant(session.restaurantId)
        );
        setClient(result.rows[0] ?? null);
        return;
      }

      if (isClientLoginUser(user) && user?.email) {
        const result = await GetAllClientManagementList({
          ...listQueryForProject(session.projectId),
          limit: 1,
          filters: {
            project_id: buildFilterClause("equals", session.projectId),
            email: buildFilterClause("equals", user.email),
          },
        });
        setClient(result.rows[0] ?? null);
        return;
      }

      setClient(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load restaurant details"
      );
      setClient(null);
    } finally {
      setLoading(false);
    }
  }, [session?.projectId, session?.restaurantId, user]);

  useEffect(() => {
    loadRestaurantClient();
  }, [loadRestaurantClient]);

  const moduleCount = useMemo(() => {
    if (!session?.modules?.length) return 0;
    return (
      session.modules.length +
      session.modules.reduce((n, m) => n + (m.children?.length ?? 0), 0)
    );
  }, [session?.modules]);

  if (!session) {
    return (
      <p className="text-sm text-muted-foreground">
        No restaurant portal active. Open a restaurant from Restaurant Master.
      </p>
    );
  }

  const planStatus = client?.plan_status ?? "—";
  const planType = client?.plan_type ?? "—";
  const planDays =
    client?.plan_remain_days != null ? `${client.plan_remain_days} days` : "—";

  return (
    <div className="dashboard-page dashboard-page--restaurant space-y-6">
      <DashboardHero
        title={`${restaurantName} dashboard`}
        subtitle={`Welcome, ${ownerName}. Manage your restaurant using the modules below.`}
        badge="Restaurant portal"
        className="dashboard-hero--portal"
      />

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Plan type"
          value={planType}
          hint="Your active subscription plan"
          icon={CreditCard}
          accent="violet"
          loading={loading}
        />
        <StatCard
          label="Plan remaining"
          value={planDays}
          hint={`Status: ${planStatus}`}
          icon={Calendar}
          accent="emerald"
          loading={loading}
        />
        <StatCard
          label="Plan amount"
          value={loading ? "—" : formatINR(client?.plan_amount)}
          hint="Amount for your current plan"
          icon={Store}
          accent="primary"
          loading={loading}
        />
        <StatCard
          label="Your modules"
          value={moduleCount}
          hint="Modules available on your plan"
          icon={Layers}
          accent="amber"
          loading={loading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm ring-1 ring-border/40 lg:col-span-2">
          <h3 className="font-heading text-sm font-semibold text-foreground">
            Restaurant details
          </h3>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3">
              <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Owner</dt>
                <dd className="text-sm font-medium">{ownerName}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Mobile</dt>
                <dd className="text-sm font-medium">{client?.mobile || "—"}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="text-sm font-medium">{client?.email || "—"}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Joined at</dt>
                <dd className="text-sm font-medium">
                  {formatDate(client?.created_at)}
                </dd>
              </div>
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Address</dt>
                <dd className="text-sm font-medium">
                  {[client?.address, client?.city, client?.state, client?.country]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm ring-1 ring-border/40">
          <h3 className="font-heading text-sm font-semibold text-foreground">
            Plan summary
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex justify-between gap-3">
              <span className="text-muted-foreground">Plan type</span>
              <span className="font-medium">{planType}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span className="text-muted-foreground">Remaining days</span>
              <span className="font-medium">{planDays}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium">{planStatus}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span className="text-muted-foreground">Plan started</span>
              <span className="font-medium">
                {formatDate(client?.plan_start_at)}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {session.modules.length > 0 ? (
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm ring-1 ring-border/40">
          <h3 className="font-heading text-sm font-semibold text-foreground">
            Your modules
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Open a module to manage {restaurantName}.
          </p>
          <div className="mt-3 space-y-3">
            {session.modules.map((mod) => (
              <div key={mod.id}>
                <button
                  type="button"
                  onClick={() => {
                    const href = portalModulePath(session.projectId, mod.id);
                    if (href) router.push(href);
                  }}
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
      ) : (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 text-center">
          <p className="text-sm font-medium text-foreground">No modules yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Modules will appear here when a plan is assigned to this restaurant.
          </p>
        </div>
      )}
    </div>
  );
}
