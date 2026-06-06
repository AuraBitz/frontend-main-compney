"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  resolveEffectivePortalFeature,
  resolvePortalFeature,
  type PortalModuleFeature,
} from "@/restaurant-management-admin-panel/lib/module-registry";
import {
  portalModulePath,
  portalProjectPath,
} from "@/restaurant-management-admin-panel/lib/portal-routes";
import { useProjectPortal } from "@/store/project-portal";

export interface PortalChildContext {
  session: NonNullable<ReturnType<typeof useProjectPortal>["session"]>;
  parentId: number;
  childId: number;
  parentName: string;
  childName: string;
  feature: PortalModuleFeature;
  valid: boolean;
}

export function usePortalChildModule(): PortalChildContext | null {
  const params = useParams();
  const { session, isActive } = useProjectPortal();

  const projectId = Number(params.projectId);
  const parentId = Number(params.moduleId);
  const childId = Number(params.childId);

  return useMemo(() => {
    if (
      !isActive ||
      !session ||
      !Number.isFinite(projectId) ||
      !Number.isFinite(parentId) ||
      !Number.isFinite(childId) ||
      session.projectId !== projectId
    ) {
      return null;
    }

    const parent = session.modules.find((m) => m.id === parentId);
    const child = parent?.children?.find((c) => c.id === childId);
    const inProject = session.moduleIds.includes(parentId);

    if (!parent || !child || !inProject) {
      return null;
    }

    const feature = resolveEffectivePortalFeature(
      child.name,
      resolvePortalFeature(parent.name, child.name),
      session
    );

    return {
      session,
      parentId,
      childId,
      parentName: parent.name,
      childName: child.name,
      feature,
      valid: true,
    };
  }, [isActive, session, projectId, parentId, childId]);
}

export function usePortalParentModule() {
  const params = useParams();
  const { session, isActive } = useProjectPortal();
  const projectId = Number(params.projectId);
  const parentId = Number(params.moduleId);

  return useMemo(() => {
    if (
      !isActive ||
      !session ||
      !Number.isFinite(projectId) ||
      !Number.isFinite(parentId) ||
      session.projectId !== projectId
    ) {
      return null;
    }
    const parent = session.modules.find((m) => m.id === parentId);
    if (!parent || !session.moduleIds.includes(parentId)) return null;
    return { session, parent, parentId };
  }, [isActive, session, projectId, parentId]);
}

export function redirectToPortalDashboard(
  router: ReturnType<typeof useRouter>,
  projectId: number
) {
  router.push(portalProjectPath(projectId));
}

export function redirectToParentModule(
  router: ReturnType<typeof useRouter>,
  projectId: number,
  parentId: number
) {
  router.push(portalModulePath(projectId, parentId));
}
