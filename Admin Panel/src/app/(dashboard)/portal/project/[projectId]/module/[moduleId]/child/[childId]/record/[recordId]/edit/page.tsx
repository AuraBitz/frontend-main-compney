"use client";

import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/layout/PageShell";
import { PortalProjectGate } from "@/restaurant-management-admin-panel/components/PortalProjectGate";
import { PortalFeatureRecord } from "@/restaurant-management-admin-panel/features/portal-feature-record";
import { PortalMenuForm } from "@/restaurant-management-admin-panel/features/portal-feature-menu";
import { PortalBookingForm } from "@/restaurant-management-admin-panel/features/portal-feature-booking";
import { PortalOrderForm } from "@/restaurant-management-admin-panel/features/portal-feature-order";
import {
  PortalPaymentForm,
  PortalTransactionForm,
} from "@/restaurant-management-admin-panel/features/portal-feature-transaction-payment";
import {
  PortalFloorForm,
  PortalTableForm,
} from "@/restaurant-management-admin-panel/features/portal-feature-floor-table";
import { usePortalChildModule } from "@/restaurant-management-admin-panel/hooks/use-portal-child-module";
import { resolveEffectivePortalFeature } from "@/restaurant-management-admin-panel/lib/module-registry";
import { resolveRestaurantId } from "@/restaurant-management-admin-panel/lib/restaurant-portal-scope";
import { useAuth } from "@/store";
import {
  portalChildPath,
  portalChildRecordEditPath,
} from "@/restaurant-management-admin-panel/lib/portal-routes";

function PortalRecordEditContent() {
  const params = useParams();
  const router = useRouter();
  const ctx = usePortalChildModule();
  const { user } = useAuth();
  const recordId = params.recordId as string;
  const projectId = Number(params.projectId);
  const parentId = Number(params.moduleId);
  const childId = Number(params.childId);

  if (!ctx) {
    return (
      <PageShell title="Edit Record" description="Open a project from Check Project first.">
        <p className="text-sm text-muted-foreground">
          No project portal is active or this module is not linked to the selected
          project.
        </p>
      </PageShell>
    );
  }

  const listPath = portalChildPath(projectId, parentId, childId);
  const editPath = portalChildRecordEditPath(
    projectId,
    parentId,
    childId,
    recordId
  );

  const effectiveFeature = resolveEffectivePortalFeature(
    ctx.childName,
    ctx.feature,
    ctx.session
  );

  const restaurantId = resolveRestaurantId(ctx.session, user);

  if (restaurantId) {
    if (effectiveFeature.featureKey === "menu_master") {
      return (
        <PageShell title="Edit Menu" description={effectiveFeature.description}>
          <PortalMenuForm
            mode="edit"
            restaurantId={restaurantId}
            recordId={recordId}
            onCancel={() => router.push(listPath)}
            onDone={() => router.push(listPath)}
          />
        </PageShell>
      );
    }
    if (effectiveFeature.featureKey === "restaurant_floor_master") {
      return (
        <PageShell title="Edit Floor" description={effectiveFeature.description}>
          <PortalFloorForm
            mode="edit"
            restaurantId={restaurantId}
            recordId={recordId}
            onCancel={() => router.push(listPath)}
            onDone={() => router.push(listPath)}
          />
        </PageShell>
      );
    }
    if (effectiveFeature.featureKey === "restaurant_table_master") {
      return (
        <PageShell title="Edit Table" description={effectiveFeature.description}>
          <PortalTableForm
            mode="edit"
            restaurantId={restaurantId}
            recordId={recordId}
            onCancel={() => router.push(listPath)}
            onDone={() => router.push(listPath)}
          />
        </PageShell>
      );
    }
    if (effectiveFeature.featureKey === "restaurant_booking_master") {
      return (
        <PageShell title="Edit Booking" description={effectiveFeature.description}>
          <PortalBookingForm
            mode="edit"
            restaurantId={restaurantId}
            recordId={recordId}
            onCancel={() => router.push(listPath)}
            onDone={() => router.push(listPath)}
          />
        </PageShell>
      );
    }
    if (effectiveFeature.featureKey === "restaurant_order_master") {
      return (
        <PageShell title="Edit Order" description={effectiveFeature.description}>
          <PortalOrderForm
            mode="edit"
            restaurantId={restaurantId}
            recordId={recordId}
            onCancel={() => router.push(listPath)}
            onDone={() => router.push(listPath)}
          />
        </PageShell>
      );
    }
    if (effectiveFeature.featureKey === "restaurant_transaction_master") {
      return (
        <PageShell
          title="Edit Transaction"
          description={effectiveFeature.description}
        >
          <PortalTransactionForm
            mode="edit"
            restaurantId={restaurantId}
            recordId={recordId}
            onCancel={() => router.push(listPath)}
            onDone={() => router.push(listPath)}
          />
        </PageShell>
      );
    }
    if (effectiveFeature.featureKey === "restaurant_payment_master") {
      return (
        <PageShell title="Edit Payment" description={effectiveFeature.description}>
          <PortalPaymentForm
            mode="edit"
            restaurantId={restaurantId}
            recordId={recordId}
            onCancel={() => router.push(listPath)}
            onDone={() => router.push(listPath)}
          />
        </PageShell>
      );
    }
  }

  return (
    <PageShell
      title={`Edit ${ctx.childName}`}
      description={`${ctx.session.projectName} — ${effectiveFeature.description}`}
    >
      <PortalFeatureRecord
        featureKey={effectiveFeature.featureKey}
        recordId={recordId}
        mode="edit"
        listPath={listPath}
        editPath={editPath}
        onCancel={() => router.push(listPath)}
        onSaved={() => router.push(listPath)}
      />
    </PageShell>
  );
}

export default function PortalRecordEditPage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  return (
    <PortalProjectGate projectId={projectId}>
      <PortalRecordEditContent />
    </PortalProjectGate>
  );
}
