"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buildFilterClause } from "@/lib/filter-builder-v2";
import { formatINR } from "@/lib/format-currency";
import { billingSuffix, resolvePlanPricing } from "@/lib/plan-pricing";
import { defaultListQuery } from "@/lib/list-query";
import { cn } from "@/lib/utils";
import { PurchasePlanGetPlan } from "@/services/api/plans-tracker.api";
import { GetAllPlansList, type PlanMasterRow } from "@/services/api/plans.api";
import { useProjectPortal } from "@/store/project-portal";
import type { ClientManagementRow } from "@/types/client-management.types";

type BillingCycle = "monthly" | "annually";

interface RestaurantPlanRenewalViewProps {
  client: ClientManagementRow;
  projectId: number;
  onActivated: () => void | Promise<void>;
}

const CARD_ACCENTS = [
  "from-slate-500/10 to-slate-500/0 border-slate-300/40",
  "from-orange-500/20 to-amber-500/5 border-orange-400/50 shadow-orange-500/10",
  "from-violet-500/15 to-indigo-500/5 border-violet-400/40",
] as const;

export function RestaurantPlanRenewalView({
  client,
  projectId,
  onActivated,
}: RestaurantPlanRenewalViewProps) {
  const { session } = useProjectPortal();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [plans, setPlans] = useState<PlanMasterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const restaurantName =
    session?.restaurantName?.trim() ||
    client.restaurant_name?.trim() ||
    "Your restaurant";

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await GetAllPlansList({
        ...defaultListQuery,
        limit: 20,
        sort: { field: "amount", order: "asc" },
        filters: {
          project_id: buildFilterClause("equals", projectId),
          range_type: buildFilterClause("equals", billingCycle),
        },
      });
      setPlans(result.rows.slice(0, 3));
    } catch (err) {
      setPlans([]);
      setError(err instanceof Error ? err.message : "Could not load plans");
    } finally {
      setLoading(false);
    }
  }, [billingCycle, projectId]);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const handleBuy = async (plan: PlanMasterRow) => {
    if (!client.login_id) {
      setError("Login account not linked. Contact support.");
      return;
    }

    setPurchasingId(plan.id);
    setError("");
    try {
      await PurchasePlanGetPlan({
        client_login_id: client.login_id,
        plan_id: plan.id,
      });
      toast.success(`${plan.plan_type} activated for ${plan.plan_valid_days} days.`);
      await onActivated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not activate plan");
    } finally {
      setPurchasingId(null);
    }
  };

  const cycleLabel = billingCycle === "monthly" ? "Monthly" : "Annually";
  const priceSuffix = billingSuffix(billingCycle);

  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-[#0b0f17] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(251,146,60,0.28),transparent)]" />
      <div className="pointer-events-none absolute -left-32 top-1/3 size-96 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-96 rounded-full bg-violet-600/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-svh max-w-6xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange-200">
            <Sparkles className="size-3.5" />
            Subscription expired
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Renew access for{" "}
            <span className="bg-gradient-to-r from-orange-300 to-amber-200 bg-clip-text text-transparent">
              {restaurantName}
            </span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
            Choose a plan to continue managing bookings, orders, menu and live
            tables. Your new validity starts immediately after purchase.
          </p>
        </header>

        <div className="mt-10 flex justify-center">
          <div
            className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md"
            role="tablist"
            aria-label="Billing cycle"
          >
            {(["monthly", "annually"] as const).map((cycle) => {
              const selected = billingCycle === cycle;
              return (
                <button
                  key={cycle}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setBillingCycle(cycle)}
                  className={cn(
                    "relative min-w-32 rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200",
                    selected
                      ? "bg-white text-slate-900 shadow-lg shadow-black/20"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {cycle === "monthly" ? "Monthly" : "Annually"}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <p
            className="mt-6 text-center text-sm text-red-300"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-10 flex flex-1 flex-col justify-center pb-8">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center text-slate-400">
              <Loader2 className="mr-2 size-5 animate-spin" />
              Loading plans…
            </div>
          ) : plans.length === 0 ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center backdrop-blur-sm">
              <p className="font-medium text-white">
                No {cycleLabel.toLowerCase()} plans available
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Ask your project admin to publish plans for this project.
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-6",
                plans.length === 1 && "mx-auto max-w-md",
                plans.length === 2 && "mx-auto max-w-3xl md:grid-cols-2",
                plans.length >= 3 && "md:grid-cols-3"
              )}
            >
              {plans.map((plan, index) => {
                const pricing = resolvePlanPricing(plan);
                const features = Array.isArray(plan.features)
                  ? plan.features.filter(Boolean)
                  : [];
                const busy = purchasingId === plan.id;
                const isFeatured = index === 1 && plans.length >= 2;

                return (
                  <article
                    key={plan.id}
                    className={cn(
                      "relative flex flex-col overflow-hidden rounded-3xl border bg-gradient-to-b p-[1px] transition duration-300 hover:-translate-y-1",
                      CARD_ACCENTS[index] ?? CARD_ACCENTS[0],
                      isFeatured && "scale-[1.02] shadow-2xl shadow-orange-500/20 md:-mt-2 md:mb-2"
                    )}
                  >
                    <div className="flex h-full flex-col rounded-[calc(1.5rem-1px)] bg-[#121826]/95 p-6 sm:p-7">
                      {isFeatured ? (
                        <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                          <Zap className="size-3" />
                          Most popular
                        </div>
                      ) : (
                        <div className="mb-4 h-6" />
                      )}

                      <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
                        {plan.plan_type}
                      </h2>
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                        <ShieldCheck className="size-3.5 text-emerald-400" />
                        {plan.plan_valid_days} days access • {cycleLabel}
                      </p>

                      <div className="mt-6 border-b border-white/10 pb-6">
                        {pricing.hasDiscount ? (
                          <p className="text-sm font-medium text-slate-500 line-through">
                            {formatINR(pricing.listPrice)}
                          </p>
                        ) : null}
                        <div className="mt-1 flex items-end gap-1">
                          <span className="text-4xl font-bold tracking-tight text-white">
                            {formatINR(pricing.payPrice)}
                          </span>
                          <span className="mb-1 text-sm text-slate-400">
                            {priceSuffix}
                          </span>
                        </div>
                        {pricing.hasDiscount ? (
                          <p className="mt-2 inline-flex rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                            Save {formatINR(pricing.savings)}
                          </p>
                        ) : null}
                      </div>

                      <ul className="mt-6 flex-1 space-y-3">
                        {features.length ? (
                          features.map((feature) => (
                            <li
                              key={`${plan.id}-${feature}`}
                              className="flex items-start gap-2.5 text-sm text-slate-300"
                            >
                              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-orange-500/15">
                                <Check className="size-3 text-orange-300" />
                              </span>
                              <span>{feature}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-slate-400">
                            Full restaurant portal access
                          </li>
                        )}
                      </ul>

                      <Button
                        type="button"
                        size="lg"
                        disabled={busy || purchasingId != null}
                        onClick={() => void handleBuy(plan)}
                        className={cn(
                          "mt-8 h-12 w-full rounded-xl text-base font-semibold",
                          isFeatured
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-400 hover:to-amber-400"
                            : "bg-white text-slate-900 hover:bg-slate-100"
                        )}
                      >
                        {busy ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Activating…
                          </>
                        ) : (
                          "Buy now"
                        )}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <p className="mt-auto pt-6 text-center text-xs text-slate-500">
          Secure activation • Instant portal access • GST inclusive pricing
        </p>
      </div>
    </div>
  );
}
