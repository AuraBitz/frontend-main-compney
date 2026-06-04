import { buildFilterClause, type ListQueryPayload } from "@/lib/filter-builder-v2";

/** Must match backend MAX_LIMIT in list-query-builder.js */
export const LIST_MAX_LIMIT = 10000;

export const defaultListQuery = {
  skip: 0,
  limit: LIST_MAX_LIMIT,
} as const;

/** Clients belonging to a single project */
export function listQueryForProject(projectId: number): ListQueryPayload {
  return {
    ...defaultListQuery,
    filters: {
      project_id: buildFilterClause("equals", projectId),
    },
  };
}
