"use client";

import { useCallback, useEffect, useState } from "react";
import { buildFilterClause } from "@/lib/filter-builder-v2";
import {
  listQueryForProject,
  listQueryForRestaurant,
} from "@/lib/list-query";
import { isClientLoginUser } from "@/lib/project-access";
import { GetAllClientManagementList } from "@/services/api/client-management.api";
import { useAuth } from "@/store";
import { useProjectPortal } from "@/store/project-portal";
import type { ClientManagementRow } from "@/types/client-management.types";

export function isRestaurantPlanExpired(
  client: ClientManagementRow | null | undefined
): boolean {
  if (!client) return false;
  if (client.plan_remain_days === 0) return true;
  return String(client.plan_status).toLowerCase() === "deactivate";
}

export function useRestaurantPortalClient(projectId: number) {
  const { user } = useAuth();
  const { session } = useProjectPortal();
  const sessionProjectId = session?.projectId;
  const sessionRestaurantId = session?.restaurantId;
  const userEmail = user?.email;
  const isClient = isClientLoginUser(user);
  const [client, setClient] = useState<ClientManagementRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadClient = useCallback(async () => {
    if (!sessionProjectId || sessionProjectId !== projectId) {
      setClient(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (sessionRestaurantId) {
        const result = await GetAllClientManagementList(
          listQueryForRestaurant(sessionRestaurantId)
        );
        setClient(result.rows[0] ?? null);
        return;
      }

      if (isClient && userEmail) {
        const result = await GetAllClientManagementList({
          ...listQueryForProject(sessionProjectId),
          limit: 1,
          filters: {
            project_id: buildFilterClause("equals", sessionProjectId),
            email: buildFilterClause("equals", userEmail),
          },
        });
        setClient(result.rows[0] ?? null);
        return;
      }

      setClient(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load account");
      setClient(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, sessionProjectId, sessionRestaurantId, isClient, userEmail]);

  useEffect(() => {
    void loadClient();
  }, [loadClient]);

  return { client, loading, error, reload: loadClient };
}
