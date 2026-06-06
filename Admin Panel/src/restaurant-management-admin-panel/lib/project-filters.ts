import {
  buildFilterClause,
  type ListQueryPayload,
} from "@/lib/filter-builder-v2";
import { defaultListQuery } from "@/lib/list-query";

export function listQueryForProject(projectId: number): ListQueryPayload {
  return {
    ...defaultListQuery,
    filters: {
      project_id: buildFilterClause("equals", projectId),
    },
  };
}

export function listQueryForProjectEmployees(
  projectId: number
): ListQueryPayload & { scope_project_id: number } {
  return {
    ...defaultListQuery,
    scope_project_id: projectId,
  };
}

export function listQueryForRestaurant(restaurantId: number): ListQueryPayload {
  return {
    ...defaultListQuery,
    filters: {
      restaurant_id: buildFilterClause("equals", restaurantId),
    },
  };
}

export function listQueryForPlanIds(planIds: number[]): ListQueryPayload {
  if (!planIds.length) {
    return { ...defaultListQuery, filters: { id: buildFilterClause("in", [-1]) } };
  }
  return {
    ...defaultListQuery,
    filters: {
      id: buildFilterClause("in", planIds),
    },
  };
}
