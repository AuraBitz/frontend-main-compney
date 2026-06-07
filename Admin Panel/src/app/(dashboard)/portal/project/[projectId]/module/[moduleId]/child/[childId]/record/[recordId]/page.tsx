"use client";

import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/layout/PageShell";
import { PortalProjectGate } from "@/restaurant-management-admin-panel/components/PortalProjectGate";
import { PortalFeatureRecord } from "@/restaurant-management-admin-panel/features/portal-feature-record";
import { PortalBookingForm } from "@/restaurant-management-admin-panel/features/portal-feature-booking";
import { PortalOrderForm } from "@/restaurant-management-admin-panel/features/portal-feature-order";
import {
  PortalPaymentForm,
  PortalTransactionForm,
} from "@/restaurant-management-admin-panel/features/portal-feature-transaction-payment";
import { PortalMenuForm } from "@/restaurant-management-admin-panel/features/portal-feature-menu";
import {
  PortalFloorForm,
  PortalTableForm,
} from "@/restaurant-management-admin-panel/features/portal-feature-floor-table";
import { resolveRestaurantId } from "@/restaurant-management-admin-panel/lib/restaurant-portal-scope";
import { useAuth } from "@/store";
import { PortalRestaurantCustomerView } from "@/restaurant-management-admin-panel/features/portal-feature-restaurant-customer";
import { PortalRestaurantView } from "@/restaurant-management-admin-panel/features/portal-feature-restaurant-view";
import { usePortalChildModule } from "@/restaurant-management-admin-panel/hooks/use-portal-child-module";
import { resolveEffectivePortalFeature } from "@/restaurant-management-admin-panel/lib/module-registry";
import {
  portalChildPath,
  portalChildRecordEditPath,
} from "@/restaurant-management-admin-panel/lib/portal-routes";

function PortalRecordViewContent() {
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
      <PageShell title="View Record" description="Open a project from Check Project first.">
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

  if (effectiveFeature.featureKey === "restaurant_master") {
    return (
      <PortalRestaurantView
        recordId={recordId}
        listPath={listPath}
        projectName={ctx.session.projectName}
      />
    );
  }

  const restaurantId = ctx ? resolveRestaurantId(ctx.session, user) : null;

  if (effectiveFeature.featureKey === "menu_master" && restaurantId) {
    return (
      <PageShell title="View Menu" description={effectiveFeature.description}>
        <PortalMenuForm
          mode="view"
          restaurantId={restaurantId}
          recordId={recordId}
          onCancel={() => router.push(listPath)}
          onEdit={() => router.push(editPath)}
          onDone={() => router.push(listPath)}
        />
      </PageShell>
    );
  }

  if (effectiveFeature.featureKey === "restaurant_customer_management") {
    return (
      <PageShell
        title="View Customer"
        description={effectiveFeature.description}
      >
        <PortalRestaurantCustomerView
          recordId={recordId}
          onCancel={() => router.push(listPath)}
        />
      </PageShell>
    );
  }

  if (effectiveFeature.featureKey === "restaurant_floor_master" && restaurantId) {
    return (
      <PageShell title="View Floor" description={effectiveFeature.description}>
        <PortalFloorForm
          mode="view"
          restaurantId={restaurantId}
          recordId={recordId}
          onCancel={() => router.push(listPath)}
          onEdit={() => router.push(editPath)}
        />
      </PageShell>
    );
  }

  if (effectiveFeature.featureKey === "restaurant_table_master" && restaurantId) {
    return (
      <PageShell title="View Table" description={effectiveFeature.description}>
        <PortalTableForm
          mode="view"
          restaurantId={restaurantId}
          recordId={recordId}
          onCancel={() => router.push(listPath)}
          onEdit={() => router.push(editPath)}
        />
      </PageShell>
    );
  }

  if (effectiveFeature.featureKey === "restaurant_booking_master" && restaurantId) {
    return (
      <PageShell title="View Booking" description={effectiveFeature.description}>
        <PortalBookingForm
          mode="view"
          restaurantId={restaurantId}
          recordId={recordId}
          onCancel={() => router.push(listPath)}
          onEdit={() => router.push(editPath)}
        />
      </PageShell>
    );
  }

  if (effectiveFeature.featureKey === "restaurant_order_master" && restaurantId) {
    return (
      <PageShell title="View Order" description={effectiveFeature.description}>
        <PortalOrderForm
          mode="view"
          restaurantId={restaurantId}
          recordId={recordId}
          onCancel={() => router.push(listPath)}
          onEdit={() => router.push(editPath)}
        />
      </PageShell>
    );
  }

  if (
    effectiveFeature.featureKey === "restaurant_transaction_master" &&
    restaurantId
  ) {
    return (
      <PageShell
        title="View Transaction"
        description={effectiveFeature.description}
      >
        <PortalTransactionForm
          mode="view"
          restaurantId={restaurantId}
          recordId={recordId}
          onCancel={() => router.push(listPath)}
          onEdit={() => router.push(editPath)}
        />
      </PageShell>
    );
  }

  if (effectiveFeature.featureKey === "restaurant_payment_master" && restaurantId) {
    return (
      <PageShell title="View Payment" description={effectiveFeature.description}>
        <PortalPaymentForm
          mode="view"
          restaurantId={restaurantId}
          recordId={recordId}
          onCancel={() => router.push(listPath)}
          onEdit={() => router.push(editPath)}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`View ${ctx.childName}`}
      description={`${ctx.session.projectName} — ${effectiveFeature.description}`}
    >
      <PortalFeatureRecord
        featureKey={effectiveFeature.featureKey}
        recordId={recordId}
        mode="view"
        listPath={listPath}
        editPath={editPath}
        onCancel={() => router.push(listPath)}
        onSaved={() => router.push(listPath)}
        onEdit={() => router.push(editPath)}
      />
    </PageShell>
  );
}

export default function PortalRecordViewPage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  return (
    <PortalProjectGate projectId={projectId}>
      <PortalRecordViewContent />
    </PortalProjectGate>
  );
}
