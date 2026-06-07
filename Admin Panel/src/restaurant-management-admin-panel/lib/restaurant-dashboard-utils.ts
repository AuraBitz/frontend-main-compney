import type { ProjectPortalSession } from "@/store/project-portal";
import {
  portalChildPath,
} from "@/restaurant-management-admin-panel/lib/portal-routes";
import {
  resolveEffectivePortalFeature,
  resolvePortalFeature,
  type PortalFeatureKey,
} from "@/restaurant-management-admin-panel/lib/module-registry";

export interface PortalModuleLink {
  parentId: number;
  childId: number;
  name: string;
  href: string;
  featureKey: PortalFeatureKey;
}

export function findPortalChildrenByFeatures(
  session: ProjectPortalSession,
  featureKeys: PortalFeatureKey[]
): PortalModuleLink[] {
  const wanted = new Set(featureKeys);
  const found: PortalModuleLink[] = [];

  for (const mod of session.modules) {
    for (const child of mod.children ?? []) {
      const feature = resolvePortalFeature(mod.name, child.name);
      const effective = resolveEffectivePortalFeature(
        child.name,
        feature,
        session
      );
      if (!wanted.has(effective.featureKey)) continue;
      if (found.some((item) => item.featureKey === effective.featureKey)) {
        continue;
      }
      found.push({
        parentId: mod.id,
        childId: child.id,
        name: child.name,
        href: portalChildPath(session.projectId, mod.id, child.id),
        featureKey: effective.featureKey,
      });
    }
  }

  return featureKeys
    .map((key) => found.find((item) => item.featureKey === key))
    .filter((item): item is PortalModuleLink => !!item);
}

export const RESTAURANT_PRIORITY_FEATURES: PortalFeatureKey[] = [
  "restaurant_live_tables",
  "restaurant_booking_master",
  "restaurant_order_master",
  "menu_master",
  "restaurant_customer_management",
  "restaurant_table_master",
  "restaurant_payment_master",
];
