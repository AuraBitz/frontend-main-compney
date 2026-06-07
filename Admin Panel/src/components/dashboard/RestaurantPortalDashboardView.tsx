"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Calendar,
  CalendarCheck2,
  CreditCard,
  LayoutGrid,
  Sparkles,
  Store,
  User,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import {
  RestaurantBarChart,
  RestaurantOccupancyRing,
  RestaurantStatusBreakdown,
} from "@/components/dashboard/RestaurantDashboardCharts";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { StatCard } from "@/components/dashboard/StatCard";
import { formatINR } from "@/lib/format-currency";
import {
  bookingTrendRange,
  groupByDay,
  groupByMonth,
  groupByYear,
  type BookingTrendGranularity,
} from "@/lib/dashboard-utils";
import { buildFilterClause } from "@/lib/filter-builder-v2";
import {
  listQueryForProject,
  listQueryForRestaurant,
} from "@/lib/list-query";
import { isClientLoginUser } from "@/lib/project-access";
import { useRestaurantDashboardStats } from "@/restaurant-management-admin-panel/hooks/use-restaurant-dashboard-stats";
import {
  findPortalChildrenByFeatures,
  RESTAURANT_PRIORITY_FEATURES,
} from "@/restaurant-management-admin-panel/lib/restaurant-dashboard-utils";
import {
  getChildModuleIcon,
  PortalNavIcon,
} from "@/restaurant-management-admin-panel/lib/portal-module-icons";
import { portalProfilePath } from "@/restaurant-management-admin-panel/lib/portal-routes";
import { GetAllClientManagementList } from "@/services/api/client-management.api";
import { useAuth } from "@/store";
import { useProjectPortal } from "@/store/project-portal";
import type { ClientManagementRow } from "@/types/client-management.types";
import { cn } from "@/lib/utils";

const PRIORITY_META: Record<
  string,
  { description: string; accent: string }
> = {
  restaurant_live_tables: {
    description: "Real-time floor plan & table control",
    accent: "from-orange-500/15 to-amber-500/5 border-orange-500/20",
  },
  restaurant_booking_master: {
    description: "Bookings, QR codes & guest sessions",
    accent: "from-violet-500/15 to-indigo-500/5 border-violet-500/20",
  },
  restaurant_order_master: {
    description: "Dine-in orders & auto order numbers",
    accent: "from-cyan-500/15 to-sky-500/5 border-cyan-500/20",
  },
  menu_master: {
    description: "Thalis, categories & item availability",
    accent: "from-emerald-500/15 to-teal-500/5 border-emerald-500/20",
  },
  restaurant_customer_management: {
    description: "Guest profiles & dining history",
    accent: "from-sky-500/15 to-blue-500/5 border-sky-500/20",
  },
  restaurant_table_master: {
    description: "Tables, chairs & floor mapping",
    accent: "from-rose-500/15 to-pink-500/5 border-rose-500/20",
  },
  restaurant_payment_master: {
    description: "Payments & settlement tracking",
    accent: "from-amber-500/15 to-yellow-500/5 border-amber-500/20",
  },
};

export function RestaurantPortalDashboardView() {
  const router = useRouter();
  const { user } = useAuth();
  const { session } = useProjectPortal();
  const [client, setClient] = useState<ClientManagementRow | null>(null);
  const [clientLoading, setClientLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingTrendGranularity, setBookingTrendGranularity] =
    useState<BookingTrendGranularity>("day");
  const ops = useRestaurantDashboardStats(session, user);

  const bookingTrendMeta = useMemo(
    () => bookingTrendRange(bookingTrendGranularity),
    [bookingTrendGranularity]
  );

  const bookingTrend = useMemo(() => {
    const getDate = (booking: (typeof ops.bookings)[number]) =>
      booking.booking_date
        ? String(booking.booking_date).slice(0, 10)
        : booking.created_at ?? null;

    const { start, end } = bookingTrendMeta;

    if (bookingTrendGranularity === "month") {
      return groupByMonth(ops.bookings, getDate, start, end);
    }
    if (bookingTrendGranularity === "year") {
      return groupByYear(ops.bookings, getDate, start, end);
    }
    return groupByDay(ops.bookings, getDate, start, end);
  }, [ops.bookings, bookingTrendGranularity, bookingTrendMeta]);

  const bookingTrendEmptyLabel =
    bookingTrendGranularity === "year"
      ? "No bookings in the last 5 years"
      : bookingTrendGranularity === "month"
        ? "No bookings in the last 12 months"
        : "No bookings in the last week";

  const restaurantName =
    session?.restaurantName?.trim() ||
    client?.restaurant_name?.trim() ||
    "Restaurant";
  const ownerName =
    session?.ownerName?.trim() || client?.owner_name?.trim() || "Owner";

  const loadRestaurantClient = useCallback(async () => {
    if (!session?.projectId) return;

    setClientLoading(true);
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
      setClientLoading(false);
    }
  }, [session?.projectId, session?.restaurantId, user]);

  useEffect(() => {
    loadRestaurantClient();
  }, [loadRestaurantClient]);

  const priorityModules = useMemo(
    () => (session ? findPortalChildrenByFeatures(session, RESTAURANT_PRIORITY_FEATURES) : []),
    [session]
  );

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
  const loading = clientLoading || ops.loading;

  return (
    <div className="dashboard-page dashboard-page--restaurant space-y-8">
      <DashboardHero
        title={`Welcome back, ${ownerName}`}
        subtitle={`${restaurantName} at a glance — bookings, tables, menu and live floor status.`}
        badge="Restaurant command center"
        className="dashboard-hero--portal border border-orange-500/15 bg-gradient-to-br from-orange-500/10 via-background to-amber-500/5"
        actions={
          <button
            type="button"
            onClick={() => router.push(portalProfilePath(session.projectId))}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-primary/20 bg-background/80 px-4 py-2.5 text-sm font-medium shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
          >
            <User className="size-4 text-primary" />
            View profile
            <ArrowUpRight className="size-4 text-muted-foreground" />
          </button>
        }
      />

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-orange-500" />
          <h2 className="font-heading text-lg font-semibold">Live restaurant status</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Today's bookings"
            value={ops.todayBookings}
            hint="Bookings scheduled for today"
            icon={CalendarCheck2}
            accent="primary"
            loading={loading}
          />
          <StatCard
            label="Active bookings"
            value={ops.activeBookings}
            hint="Pending + confirmed right now"
            icon={Calendar}
            accent="amber"
            loading={loading}
          />
          <StatCard
            label="Tables occupied"
            value={`${ops.tableStats.reserved + ops.tableStats.booked}/${ops.tableStats.total}`}
            hint={`${ops.tableStats.available} available now`}
            icon={LayoutGrid}
            accent="emerald"
            loading={loading}
          />
          <StatCard
            label="Total customers"
            value={ops.customerTotal}
            hint={`${ops.manualBookings} manual booking QR ready`}
            icon={Users}
            accent="violet"
            loading={loading}
          />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RestaurantBarChart
            data={bookingTrend}
            loading={ops.loading}
            title="Bookings trend"
            description={bookingTrendMeta.description}
            emptyLabel={bookingTrendEmptyLabel}
            granularity={bookingTrendGranularity}
            onGranularityChange={setBookingTrendGranularity}
          />
        </div>
        <RestaurantOccupancyRing
          available={ops.tableStats.available}
          reserved={ops.tableStats.reserved}
          booked={ops.tableStats.booked}
          total={ops.tableStats.total}
          loading={ops.loading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RestaurantStatusBreakdown
          items={ops.bookingStatus}
          loading={ops.loading}
          title="Booking pipeline"
          description="Current booking status distribution"
        />
        <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-violet-500/10 via-card to-card p-5 shadow-sm">
          <h3 className="font-heading text-base font-semibold">Plan & subscription</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your restaurant plan at a glance
          </p>
          <ul className="mt-5 space-y-3">
            <PlanRow label="Plan type" value={planType} loading={clientLoading} />
            <PlanRow label="Remaining days" value={planDays} loading={clientLoading} />
            <PlanRow label="Status" value={planStatus} loading={clientLoading} />
            <PlanRow
              label="Plan amount"
              value={clientLoading ? "…" : formatINR(client?.plan_amount)}
              loading={clientLoading}
            />
          </ul>
        </div>
      </div>

      {priorityModules.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h3 className="font-heading text-lg font-semibold">Important modules</h3>
            <p className="text-sm text-muted-foreground">
              Jump straight into the tools you use every day
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {priorityModules.map((mod) => {
              const Icon = getChildModuleIcon(mod.name);
              const meta = PRIORITY_META[mod.featureKey] ?? {
                description: "Open module",
                accent: "from-primary/10 to-primary/5 border-primary/20",
              };
              return (
                <button
                  key={mod.featureKey}
                  type="button"
                  onClick={() => router.push(mod.href)}
                  className={cn(
                    "group cursor-pointer rounded-2xl border bg-gradient-to-br p-5 text-left shadow-sm transition",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    meta.accent
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-background/80 shadow-sm">
                      <PortalNavIcon icon={Icon} className="size-5 text-primary" />
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:text-primary" />
                  </div>
                  <p className="mt-4 font-semibold text-foreground">{mod.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {meta.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-heading text-base font-semibold">Restaurant snapshot</h3>
            <p className="text-sm text-muted-foreground">
              Owner & location details for {restaurantName}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SnapshotPill icon={Store} label={restaurantName} />
            <SnapshotPill icon={UtensilsCrossed} label={`${ops.tableStats.total} tables`} />
            <SnapshotPill icon={CreditCard} label={planType} />
          </div>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MiniStat label="Owner" value={ownerName} />
          <MiniStat label="Mobile" value={client?.mobile} />
          <MiniStat label="Email" value={client?.email} />
          <MiniStat
            label="Location"
            value={[client?.city, client?.state].filter(Boolean).join(", ")}
          />
        </dl>
      </section>
    </div>
  );
}

function PlanRow({
  label,
  value,
  loading,
}: {
  label: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg bg-background/70 px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold capitalize">{loading ? "…" : value}</span>
    </li>
  );
}

function SnapshotPill({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/30 px-3 py-1 text-xs font-medium">
      <Icon className="size-3.5 text-primary" />
      {label}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl bg-muted/30 px-3 py-2.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value?.trim() || "—"}</dd>
    </div>
  );
}
