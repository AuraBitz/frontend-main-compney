"use client";

import { useEffect, useState } from "react";
import {
  clientLoginPortalExtras,
  resolveRestaurantId,
} from "@/restaurant-management-admin-panel/lib/restaurant-portal-scope";
import { buildFilterClause } from "@/lib/filter-builder-v2";
import { defaultListQuery } from "@/lib/list-query";
import { loadProjectPortalSession } from "@/lib/load-project-portal-session";
import { GetAllClientManagementList } from "@/services/api/client-management.api";
import {
  canAccessProject,
  isClientLoginUser,
  isProjectOnlyUser,
} from "@/lib/project-access";
import { GetProjectById } from "@/services/api/projects.api";
import { useAuth } from "@/store";
import { useProjectPortal } from "@/store/project-portal";

export function useEnsurePortalSession(projectId: number) {
  const { user } = useAuth();
  const { session, enterPortal, hydrated } = useProjectPortal();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hydrated) {
      setReady(false);
      return;
    }

    if (!Number.isFinite(projectId) || projectId <= 0) {
      setError("Invalid project.");
      setReady(false);
      return;
    }

    if (!canAccessProject(user, projectId)) {
      setError("You do not have access to this project.");
      setReady(false);
      return;
    }

    // Reuse any stored portal session for this project (project or restaurant preview).
    if (session?.projectId === projectId) {
      const needsClientEnrich =
        isClientLoginUser(user) &&
        (!resolveRestaurantId(session, user) ||
          session.viewMode !== "restaurant");

      if (needsClientEnrich && user?.restaurantId) {
        enterPortal({ ...session, ...clientLoginPortalExtras(user) });
        setError("");
        setReady(true);
        return;
      }

      if (needsClientEnrich && user?.email) {
        let cancelled = false;
        setReady(false);
        GetAllClientManagementList({
          ...defaultListQuery,
          limit: 1,
          filters: {
            project_id: buildFilterClause("equals", projectId),
            email: buildFilterClause("equals", user.email),
          },
        })
          .then((result) => {
            if (cancelled) return;
            const row = result.rows[0];
            const restaurantId =
              row?.restaurant_id != null
                ? Number(row.restaurant_id)
                : user.restaurantId ?? null;
            enterPortal({
              ...session,
              viewMode: "restaurant",
              restaurantId,
              restaurantName:
                session.restaurantName ??
                row?.restaurant_name ??
                user.restaurantName ??
                null,
              ownerName:
                session.ownerName ?? row?.owner_name ?? user.ownerName ?? null,
              planId: session.planId ?? user.planId ?? null,
            });
            setReady(true);
          })
          .catch(() => {
            if (cancelled) return;
            enterPortal({ ...session, ...clientLoginPortalExtras(user) });
            setReady(true);
          });
        return () => {
          cancelled = true;
        };
      }

      setError("");
      setReady(true);
      return;
    }

    let cancelled = false;
    setReady(false);
    setError("");

    GetProjectById(projectId)
      .then((project) =>
        loadProjectPortalSession(project, {
          roleMasterId:
            isProjectOnlyUser(user) && !isClientLoginUser(user)
              ? user?.roleMasterId
              : null,
          planId: isClientLoginUser(user) ? (user?.planId ?? 0) : null,
        })
      )
      .then((portalSession) => {
        if (cancelled) return;
        const next =
          isClientLoginUser(user)
            ? { ...portalSession, ...clientLoginPortalExtras(user!) }
            : portalSession;
        enterPortal(next);
        setReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load project portal."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, projectId, session?.projectId, enterPortal, user]);

  const activeSession =
    session?.projectId === projectId && ready ? session : null;

  return { ready, error, session: activeSession };
}
