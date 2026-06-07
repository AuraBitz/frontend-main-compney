"use client";

import type { PlanMasterRow } from "@/services/api/plans.api";

export interface PlanPricing {
  payPrice: number;
  listPrice: number;
  savings: number;
  hasDiscount: boolean;
}

/** `amount` is the price to pay; `discount_amount` is savings off the list price. */
export function resolvePlanPricing(plan: PlanMasterRow): PlanPricing {
  const payPrice = Number(plan.amount) || 0;
  const savings = Number(plan.discount_amount) || 0;
  const listPrice = savings > 0 ? payPrice + savings : payPrice;

  return {
    payPrice,
    listPrice,
    savings,
    hasDiscount: savings > 0 && listPrice > payPrice,
  };
}

export function billingSuffix(cycle: "monthly" | "annually"): string {
  return cycle === "monthly" ? "/month" : "/year";
}
