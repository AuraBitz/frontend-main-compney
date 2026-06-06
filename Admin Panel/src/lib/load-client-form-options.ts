import { GetAllPlansList } from "@/services/api/plans.api";
import { GetAllProjectsList } from "@/services/api/projects.api";
import { GetAllRestaurantsList } from "@/services/api/restaurant-master.api";
import { defaultListQuery } from "@/lib/list-query";
import type { ClientFormOptions } from "@/lib/client-form-config";
import type { DynamicSelectOption } from "@/types/dynamic-form.types";

interface PlanRow {
  id: number;
  plan_type: string;
}

interface ProjectRow {
  id: number;
  name: string;
}

export async function loadClientFormOptions(): Promise<ClientFormOptions> {
  const [plans, projects, restaurants] = await Promise.all([
    GetAllPlansList(defaultListQuery),
    GetAllProjectsList(defaultListQuery),
    GetAllRestaurantsList(defaultListQuery),
  ]);

  const planRows = plans.rows as PlanRow[];
  const projectRows = projects.rows as ProjectRow[];
  const restaurantRows = restaurants.rows as {
    id: number;
    restaurant_name: string;
  }[];
  return {
    planOptions: planRows.map((p) => ({
      label: p.plan_type || `Plan #${p.id}`,
      value: String(p.id),
    })) as DynamicSelectOption[],
    projectOptions: projectRows.map((p) => ({
      label: p.name || `Project #${p.id}`,
      value: String(p.id),
    })) as DynamicSelectOption[],
    restaurantOptions: restaurantRows.map((r) => ({
      label: r.restaurant_name || `Restaurant #${r.id}`,
      value: String(r.id),
    })) as DynamicSelectOption[],
  };
}
