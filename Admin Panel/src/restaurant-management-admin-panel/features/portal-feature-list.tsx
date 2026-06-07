"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import { Plus, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DynamicTable,
  deleteRowAction,
  editRowAction,
  viewRowAction,
  type TableRowAction,
} from "@/components/dynamicTable";
import type { PortalChildContext } from "@/restaurant-management-admin-panel/hooks/use-portal-child-module";
import {
  getPortalFeaturePaths,
  resolveEffectivePortalFeature,
  type PortalFeatureKey,
} from "@/restaurant-management-admin-panel/lib/module-registry";
import { RestaurantMenuCards } from "@/restaurant-management-admin-panel/features/portal-menu-cards";
import { BookingQrDialog } from "@/restaurant-management-admin-panel/components/ManualBookingQrDialog";
import { PortalLiveTables } from "@/restaurant-management-admin-panel/features/portal-live-tables";
import {
  listQueryForPlanIds,
  listQueryForProject,
} from "@/restaurant-management-admin-panel/lib/project-filters";
import { restaurantListQuery } from "@/restaurant-management-admin-panel/lib/restaurant-portal-scope";
import { useAuth } from "@/store";
import type { ListQueryPayload } from "@/lib/filter-builder-v2";
import { GetAllRestaurantCustomersList } from "@/services/api/restaurant-customer-management.api";
import { GetAllRestaurantFloorsList } from "@/services/api/restaurant-floor-master.api";
import { GetAllRestaurantTablesList } from "@/services/api/restaurant-table-master.api";
import { GetAllRestaurantBookingsList } from "@/services/api/restaurant-booking-master.api";
import { GetAllRestaurantOrderMasterList } from "@/services/api/restaurant-order-master.api";
import { GetAllRestaurantTransactionsList } from "@/services/api/restaurant-transaction-master.api";
import { GetAllRestaurantPaymentsList } from "@/services/api/restaurant-payment-master.api";
import type {
  RestaurantBookingRow,
  RestaurantCustomerRow,
  RestaurantFloorRow,
  RestaurantOrderMasterRow,
  RestaurantPaymentRow,
  RestaurantTableRow,
  RestaurantTransactionRow,
} from "@/types/restaurant-ops.types";
import { withStatusSetFilter } from "@/lib/table-column-utils";
import { formatDateDDMMYYYY, formatTimeString12 } from "@/utils/format-date";
import { formatOrderStatus } from "@/restaurant-management-admin-panel/features/portal-feature-order";
import type { ParentModuleRow } from "@/lib/parent-module-form-config";
import {
  DeleteParentModule,
  GetAllParentModulesList,
} from "@/services/api/parent-modules.api";
import {
  DeleteChildModule,
  GetAllChildModulesList,
  type ChildModuleRow,
} from "@/services/api/child-modules.api";
import { ProjectEmployeeMasterList } from "@/restaurant-management-admin-panel/features/project-employee-master";
import {
  portalChildPath,
  portalChildRecordEditPath,
  portalChildRecordPath,
} from "@/restaurant-management-admin-panel/lib/portal-routes";
import { GetAllClientManagementList } from "@/services/api/client-management.api";
import {
  DeletePermission,
  GetAllPermissionsList,
} from "@/services/api/permissions.api";
import {
  portalChildPermissionEditPath,
  portalChildPermissionPath,
} from "@/restaurant-management-admin-panel/lib/portal-routes";
import { GetAllPlansTrackerList } from "@/services/api/plans-tracker.api";
import { GetAllPaymentTypesList } from "@/services/api/payment-type.api";
import { GetAllPlansList } from "@/services/api/plans.api";
import {
  GetAllRestaurantsList,
  type RestaurantMasterRow,
} from "@/services/api/restaurant-master.api";
import { GetAllRolesList } from "@/services/api/roles.api";
import type { PlansTrackerRow } from "@/types/plans-tracker.types";
import {
  DeleteTransaction,
  GetAllTransactionsList,
  type TransactionMasterRow,
} from "@/services/api/transactions.api";
import type { ClientManagementRow } from "@/types/client-management.types";
import type { PermissionMasterRow } from "@/types/permission-master.types";

interface PortalFeatureListProps {
  ctx: PortalChildContext;
}

function portalRecordViewHref(
  ctx: PortalChildContext,
  recordId: number | string | undefined
) {
  if (recordId == null) return null;
  return portalChildRecordPath(
    ctx.session.projectId,
    ctx.parentId,
    ctx.childId,
    recordId
  );
}

function portalRecordEditHref(
  ctx: PortalChildContext,
  recordId: number | string | undefined
) {
  if (recordId == null) return null;
  return portalChildRecordEditPath(
    ctx.session.projectId,
    ctx.parentId,
    ctx.childId,
    recordId
  );
}

function useRestaurantScopeQuery(ctx: PortalChildContext): ListQueryPayload {
  const { user } = useAuth();
  return useMemo(
    () => restaurantListQuery(ctx.session, user),
    [ctx.session, user]
  );
}

function mergeScopedListQuery(
  scope: ListQueryPayload,
  gridQuery: ListQueryPayload
): ListQueryPayload {
  return {
    ...scope,
    ...gridQuery,
    filters: {
      ...scope.filters,
      ...gridQuery.filters,
    },
  };
}

export function PortalFeatureList({ ctx }: PortalFeatureListProps) {
  const effectiveFeature = resolveEffectivePortalFeature(
    ctx.childName,
    ctx.feature,
    ctx.session
  );

  if (effectiveFeature.featureKey === "restaurant_live_tables") {
    return <PortalLiveTables ctx={ctx} />;
  }

  const paths = getPortalFeaturePaths(
    ctx.session.projectId,
    ctx.parentId,
    ctx.childId
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {ctx.session.viewMode === "restaurant" && ctx.session.restaurantName
            ? `${ctx.session.restaurantName} · ${ctx.parentName} / ${ctx.childName}`
            : `${ctx.session.projectName} · ${ctx.parentName} / ${ctx.childName}`}
        </p>
        {effectiveFeature.supportsCreate && (
          <Button
            render={<Link href={paths.create} />}
            className="h-10 gap-2"
          >
            <Plus className="size-4" />
            {effectiveFeature.featureKey === "menu_master"
              ? "Create thali"
              : `Create ${ctx.childName}`}
          </Button>
        )}
      </div>
      <PortalFeatureTable ctx={ctx} featureKey={effectiveFeature.featureKey} />
    </div>
  );
}

function PortalFeatureTable({
  ctx,
  featureKey,
}: {
  ctx: PortalChildContext;
  featureKey: PortalFeatureKey;
}) {
  switch (featureKey) {
    case "client_management":
      return <ProjectClientTable ctx={ctx} />;
    case "transaction_master":
      return <ProjectTransactionTable ctx={ctx} />;
    case "payment_type_master":
      return <PaymentTypeTable ctx={ctx} />;
    case "role_master":
      return <ProjectRoleTable ctx={ctx} />;
    case "plans_master":
      return <ProjectPlanTable ctx={ctx} />;
    case "plans_tracker":
      return <ProjectPlansTrackerTable ctx={ctx} />;
    case "restaurant_master":
      return <ProjectRestaurantTable ctx={ctx} />;
    case "permission_master":
      return <PermissionTable ctx={ctx} />;
    case "parent_modules":
      return <ProjectParentModuleTable ctx={ctx} />;
    case "child_modules":
      return <ProjectChildModuleTable ctx={ctx} />;
    case "menu_master":
      return <RestaurantMenuCards ctx={ctx} />;
    case "restaurant_customer_management":
      return <RestaurantCustomerTable ctx={ctx} />;
    case "restaurant_floor_master":
      return <RestaurantFloorTable ctx={ctx} />;
    case "restaurant_table_master":
      return <RestaurantTableTable ctx={ctx} />;
    case "restaurant_booking_master":
      return <RestaurantBookingTable ctx={ctx} />;
    case "restaurant_order_master":
      return <RestaurantOrderMasterTable ctx={ctx} />;
    case "restaurant_transaction_master":
      return <RestaurantTransactionTable ctx={ctx} />;
    case "restaurant_payment_master":
      return <RestaurantPaymentTable ctx={ctx} />;
    case "employee_master":
      return (
        <ProjectEmployeeMasterList
          embedded
          projectId={ctx.session.projectId}
          projectName={ctx.session.projectName}
          createHref={getPortalFeaturePaths(
            ctx.session.projectId,
            ctx.parentId,
            ctx.childId
          ).create}
          editHref={(employeeId) =>
            `${portalChildPath(
              ctx.session.projectId,
              ctx.parentId,
              ctx.childId
            )}/${employeeId}/edit`
          }
        />
      );
    case "bank_master":
      return (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Bank Master for {ctx.session.projectName} — configure records from admin when API is ready.
        </p>
      );
    default:
      return (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No list view mapped for &quot;{ctx.childName}&quot; yet.
        </p>
      );
  }
}

function ProjectClientTable({ ctx }: { ctx: PortalChildContext }) {
  const router = useRouter();
  const query = useMemo(
    () => listQueryForProject(ctx.session.projectId),
    [ctx.session.projectId]
  );

  const fetchRows = useCallback(async () => {
    return GetAllClientManagementList(query);
  }, [query]);

  const columnDefs = useMemo<ColDef<ClientManagementRow>[]>(
    () => [
      {
        field: "restaurant_name",
        headerName: "Restaurant Name",
        minWidth: 160,
        flex: 1,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "owner_name",
        headerName: "Owner",
        minWidth: 140,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "mobile",
        headerName: "Mobile",
        minWidth: 120,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "email",
        headerName: "Email",
        minWidth: 180,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "plan_type",
        headerName: "Plan Type",
        minWidth: 130,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "plan_remain_days",
        headerName: "Plan Remaining Days",
        minWidth: 150,
        valueFormatter: (p) =>
          p.value == null ? "—" : `${p.value} days`,
      },
      {
        field: "created_at",
        headerName: "Joined At",
        minWidth: 150,
        valueFormatter: (p) => p.value || "—",
      },
    ],
    []
  );

  return (
    <DynamicTable<ClientManagementRow>
      rowData={[]}
      columnDefs={columnDefs}
      onServerFilter={fetchRows}
      emptyMessage={`No clients for ${ctx.session.projectName}`}
      height="520px"
      dateFields={["created_at"]}
      rowActions={[
        viewRowAction((row) => {
          const href = portalRecordViewHref(ctx, row.id);
          if (href) router.push(href);
        }),
        editRowAction((row) => {
          const href = portalRecordEditHref(ctx, row.id);
          if (href) router.push(href);
        }),
      ]}
    />
  );
}

function ProjectTransactionTable({ ctx }: { ctx: PortalChildContext }) {
  const router = useRouter();
  const [rows, setRows] = useState<TransactionMasterRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const query = useMemo(
    () => listQueryForProject(ctx.session.projectId),
    [ctx.session.projectId]
  );
  const load = useCallback(() => {
    setLoading(true);
    GetAllTransactionsList(query)
      .then((r) => {
        setRows(r.rows);
        setTotal(r.total);
      })
      .catch(() => {
        setRows([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const columnDefs = useMemo<ColDef<TransactionMasterRow>[]>(
    () => [
      { field: "payment_type", headerName: "Payment Type", minWidth: 130 },
      { field: "transaction_no", headerName: "Transaction No", minWidth: 150, flex: 1 },
      { field: "customer_name", headerName: "Customer", minWidth: 140 },
      { field: "transaction_date", headerName: "Date", minWidth: 130 },
      { field: "account", headerName: "Account", minWidth: 120 },
    ],
    []
  );

  const rowActions = useMemo<TableRowAction<TransactionMasterRow>[]>(
    () => [
      viewRowAction((row) => {
        const href = portalRecordViewHref(ctx, row.id);
        if (href) router.push(href);
      }),
      editRowAction((row) => {
        const href = portalRecordEditHref(ctx, row.id);
        if (href) router.push(href);
      }),
      deleteRowAction(async (row) => {
        await DeleteTransaction(row.id);
        load();
      }),
    ],
    [ctx.childId, ctx.parentId, ctx.session.projectId, load, router]
  );

  return (
    <DynamicTable<TransactionMasterRow>
      rowData={rows}
      columnDefs={columnDefs}
      rowActions={rowActions}
      loading={loading}
      totalRowCount={total}
      emptyMessage={`No transactions for ${ctx.session.projectName}`}
      height="520px"
      dateFields={["transaction_date", "created_at"]}
    />
  );
}

function PaymentTypeTable({ ctx }: { ctx: PortalChildContext }) {
  const router = useRouter();
  const [rows, setRows] = useState<{ id: number; type?: string; status?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetAllPaymentTypesList()
      .then((r) => setRows(r.rows))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: "type", headerName: "Type", minWidth: 180, flex: 1 },
      { field: "status", headerName: "Status", minWidth: 120 },
    ],
    []
  );

  return (
    <DynamicTable
      rowData={rows}
      columnDefs={columnDefs}
      loading={loading}
      totalRowCount={rows.length}
      emptyMessage="No payment types found"
      height="520px"
      rowActions={[
        viewRowAction((row) => {
          const href = portalRecordViewHref(ctx, row.id);
          if (href) router.push(href);
        }),
        editRowAction((row) => {
          const href = portalRecordEditHref(ctx, row.id);
          if (href) router.push(href);
        }),
      ]}
    />
  );
}

function ProjectRoleTable({ ctx }: { ctx: PortalChildContext }) {
  const router = useRouter();
  const [rows, setRows] = useState<
    { id: number; role_name?: string; role_code?: string; project_ids?: number[] }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetAllRolesList()
      .then((r) => {
        const projectId = ctx.session.projectId;
        const filtered = r.rows.filter((row) =>
          (row.project_ids ?? []).map(Number).includes(projectId)
        );
        setRows(filtered);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [ctx.session.projectId]);

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: "role_name", headerName: "Role", minWidth: 160, flex: 1 },
      { field: "role_code", headerName: "Code", minWidth: 100 },
      { field: "status", headerName: "Status", minWidth: 100 },
    ],
    []
  );

  return (
    <DynamicTable
      rowData={rows}
      columnDefs={columnDefs}
      loading={loading}
      totalRowCount={rows.length}
      emptyMessage={`No roles linked to ${ctx.session.projectName}`}
      height="520px"
      rowActions={[
        viewRowAction((row) => {
          const href = portalRecordViewHref(ctx, row.id);
          if (href) router.push(href);
        }),
        editRowAction((row) => {
          const href = portalRecordEditHref(ctx, row.id);
          if (href) router.push(href);
        }),
      ]}
    />
  );
}

function ProjectPlanTable({ ctx }: { ctx: PortalChildContext }) {
  const router = useRouter();
  const planIds = ctx.session.planIds ?? [];
  const query = useMemo(() => listQueryForPlanIds(planIds), [planIds]);
  const [rows, setRows] = useState<{ id: number; plan_type?: string; amount?: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!planIds.length) {
      setRows([]);
      setLoading(false);
      return;
    }
    GetAllPlansList(query)
      .then((r) => setRows(r.rows))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [query, planIds.length]);

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: "plan_type", headerName: "Plan", minWidth: 160, flex: 1 },
      { field: "amount", headerName: "Amount", minWidth: 100 },
      { field: "plan_valid_days", headerName: "Valid Days", minWidth: 110 },
    ],
    []
  );

  return (
    <DynamicTable
      rowData={rows}
      columnDefs={columnDefs}
      loading={loading}
      totalRowCount={rows.length}
      emptyMessage={`No plans assigned to ${ctx.session.projectName}`}
      height="520px"
      rowActions={[
        viewRowAction((row) => {
          const href = portalRecordViewHref(ctx, row.id);
          if (href) router.push(href);
        }),
        editRowAction((row) => {
          const href = portalRecordEditHref(ctx, row.id);
          if (href) router.push(href);
        }),
      ]}
    />
  );
}

function RestaurantCustomerTable({ ctx }: { ctx: PortalChildContext }) {
  const router = useRouter();
  const query = useRestaurantScopeQuery(ctx);

  const fetchRows = useCallback(
    async (gridQuery: ListQueryPayload) => {
      return GetAllRestaurantCustomersList(
        mergeScopedListQuery(query, gridQuery)
      );
    },
    [query]
  );

  const columnDefs = useMemo<ColDef<RestaurantCustomerRow>[]>(
    () => [
      {
        field: "customer_name",
        headerName: "Customer Name",
        minWidth: 160,
        flex: 1,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "email",
        headerName: "Email",
        minWidth: 180,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "phone",
        headerName: "Phone",
        minWidth: 120,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "current_status",
        headerName: "Status",
        minWidth: 110,
        flex: 0,
        valueFormatter: (p) =>
          p.value ? String(p.value).replace(/_/g, " ") : "—",
      },
      {
        field: "address",
        headerName: "Address",
        minWidth: 180,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "created_at",
        headerName: "Joined At",
        minWidth: 140,
        valueFormatter: (p) => p.value || "—",
      },
    ],
    []
  );

  return (
    <DynamicTable<RestaurantCustomerRow>
      rowData={[]}
      columnDefs={columnDefs}
      onServerFilter={fetchRows}
      dateFields={["created_at"]}
      emptyMessage="No customers found for this restaurant"
      height="520px"
      rowActions={[
        viewRowAction((row) => {
          const href = portalRecordViewHref(ctx, row.id);
          if (href) router.push(href);
        }),
      ]}
    />
  );
}

function RestaurantFloorTable({ ctx }: { ctx: PortalChildContext }) {
  const router = useRouter();
  const query = useRestaurantScopeQuery(ctx);

  const fetchRows = useCallback(
    async (gridQuery: ListQueryPayload) => {
      return GetAllRestaurantFloorsList(mergeScopedListQuery(query, gridQuery));
    },
    [query]
  );

  const columnDefs = useMemo<ColDef<RestaurantFloorRow>[]>(
    () => [
      { field: "id", headerName: "ID", minWidth: 70 },
      { field: "floor_no", headerName: "Floor No", minWidth: 100 },
      { field: "created_at", headerName: "Created", minWidth: 150 },
    ],
    []
  );

  return (
    <DynamicTable<RestaurantFloorRow>
      rowData={[]}
      columnDefs={columnDefs}
      onServerFilter={fetchRows}
      dateFields={["created_at"]}
      emptyMessage="No floors found"
      height="520px"
      rowActions={[
        viewRowAction((row) => {
          const href = portalRecordViewHref(ctx, row.id);
          if (href) router.push(href);
        }),
        editRowAction((row) => {
          const href = portalRecordEditHref(ctx, row.id);
          if (href) router.push(href);
        }),
      ]}
    />
  );
}

function RestaurantTableTable({ ctx }: { ctx: PortalChildContext }) {
  const router = useRouter();
  const query = useRestaurantScopeQuery(ctx);

  const fetchRows = useCallback(
    async (gridQuery: ListQueryPayload) => {
      return GetAllRestaurantTablesList(mergeScopedListQuery(query, gridQuery));
    },
    [query]
  );

  const columnDefs = useMemo<ColDef<RestaurantTableRow>[]>(
    () => [
      { field: "table_number", headerName: "Table", minWidth: 100 },
      { field: "floor_no", headerName: "Floor", minWidth: 90 },
      { field: "chair_count", headerName: "Chairs", minWidth: 90 },
    ],
    []
  );

  return (
    <DynamicTable<RestaurantTableRow>
      rowData={[]}
      columnDefs={columnDefs}
      onServerFilter={fetchRows}
      emptyMessage="No tables found"
      height="520px"
      rowActions={[
        viewRowAction((row) => {
          const href = portalRecordViewHref(ctx, row.id);
          if (href) router.push(href);
        }),
        editRowAction((row) => {
          const href = portalRecordEditHref(ctx, row.id);
          if (href) router.push(href);
        }),
      ]}
    />
  );
}

function RestaurantTransactionTable({ ctx }: { ctx: PortalChildContext }) {
  const router = useRouter();
  const query = useRestaurantScopeQuery(ctx);

  const fetchRows = useCallback(
    async (gridQuery: ListQueryPayload) => {
      return GetAllRestaurantTransactionsList(
        mergeScopedListQuery(query, gridQuery)
      );
    },
    [query]
  );

  const columnDefs = useMemo<ColDef<RestaurantTransactionRow>[]>(
    () => [
      {
        field: "customer_name",
        headerName: "Customer",
        minWidth: 150,
        flex: 1,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "account_number",
        headerName: "Account No",
        minWidth: 130,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "bank_name",
        headerName: "Bank",
        minWidth: 130,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "transaction_at",
        headerName: "Transaction Date",
        minWidth: 130,
        valueFormatter: (p) =>
          p.value ? formatDateDDMMYYYY(String(p.value)) || "—" : "—",
      },
      {
        field: "transaction_by",
        headerName: "Transaction By",
        minWidth: 130,
        valueFormatter: (p) => p.value || "—",
      },
    ],
    []
  );

  return (
    <DynamicTable<RestaurantTransactionRow>
      rowData={[]}
      columnDefs={columnDefs}
      onServerFilter={fetchRows}
      dateFields={["transaction_at"]}
      emptyMessage="No transactions found"
      height="520px"
      rowActions={[
        viewRowAction((row) => {
          const href = portalRecordViewHref(ctx, row.id);
          if (href) router.push(href);
        }),
        editRowAction((row) => {
          const href = portalRecordEditHref(ctx, row.id);
          if (href) router.push(href);
        }),
      ]}
    />
  );
}

function RestaurantPaymentTable({ ctx }: { ctx: PortalChildContext }) {
  const router = useRouter();
  const query = useRestaurantScopeQuery(ctx);

  const fetchRows = useCallback(
    async (gridQuery: ListQueryPayload) => {
      return GetAllRestaurantPaymentsList(
        mergeScopedListQuery(query, gridQuery)
      );
    },
    [query]
  );

  const columnDefs = useMemo<ColDef<RestaurantPaymentRow>[]>(
    () => [
      {
        field: "order_id",
        headerName: "Order",
        minWidth: 90,
        valueFormatter: (p) => (p.value != null ? `#${p.value}` : "—"),
      },
      {
        field: "transaction_id",
        headerName: "Transaction",
        minWidth: 110,
        valueFormatter: (p) => (p.value != null ? `#${p.value}` : "—"),
      },
      {
        field: "is_cash_amount",
        headerName: "Cash",
        minWidth: 80,
        valueFormatter: (p) => (p.value === true ? "Yes" : "No"),
      },
      {
        field: "amount",
        headerName: "Amount",
        minWidth: 100,
        valueFormatter: (p) =>
          p.value != null ? String(p.value) : "—",
      },
      {
        field: "payment_at",
        headerName: "Payment Date",
        minWidth: 130,
        valueFormatter: (p) =>
          p.value ? formatDateDDMMYYYY(String(p.value)) || "—" : "—",
      },
    ],
    []
  );

  return (
    <DynamicTable<RestaurantPaymentRow>
      rowData={[]}
      columnDefs={columnDefs}
      onServerFilter={fetchRows}
      dateFields={["payment_at"]}
      emptyMessage="No payments found"
      height="520px"
      rowActions={[
        viewRowAction((row) => {
          const href = portalRecordViewHref(ctx, row.id);
          if (href) router.push(href);
        }),
        editRowAction((row) => {
          const href = portalRecordEditHref(ctx, row.id);
          if (href) router.push(href);
        }),
      ]}
    />
  );
}

function RestaurantBookingTable({ ctx }: { ctx: PortalChildContext }) {
  const router = useRouter();
  const query = useRestaurantScopeQuery(ctx);
  const [qrBooking, setQrBooking] = useState<RestaurantBookingRow | null>(null);

  const fetchRows = useCallback(
    async (gridQuery: ListQueryPayload) => {
      return GetAllRestaurantBookingsList(
        mergeScopedListQuery(query, gridQuery)
      );
    },
    [query]
  );

  const columnDefs = useMemo<ColDef<RestaurantBookingRow>[]>(
    () => [
      {
        field: "customer_name",
        headerName: "Customer Name",
        minWidth: 150,
        flex: 1,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "customer_phone",
        headerName: "Customer Phone",
        minWidth: 130,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "booking_date",
        headerName: "Booking Date",
        minWidth: 120,
      },
      {
        field: "booking_time",
        headerName: "Booking Time",
        minWidth: 110,
        valueFormatter: (p) =>
          p.value ? formatTimeString12(String(p.value)) || "—" : "—",
      },
      {
        field: "floor_no",
        headerName: "Floor",
        minWidth: 90,
        valueFormatter: (p) =>
          p.value != null ? `Floor ${p.value}` : "—",
      },
      {
        field: "table_number",
        headerName: "Table",
        minWidth: 90,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "booking_status",
        headerName: "Booking Status",
        minWidth: 120,
        valueFormatter: (p) =>
          p.value ? String(p.value).replace(/_/g, " ") : "—",
      },
      {
        field: "is_manual_booking",
        headerName: "Manual Booking",
        minWidth: 130,
        valueFormatter: (p) => (p.value === true ? "Yes" : "No"),
      },
    ],
    []
  );

  return (
    <>
      <DynamicTable<RestaurantBookingRow>
        rowData={[]}
        columnDefs={columnDefs}
        onServerFilter={fetchRows}
        dateFields={["booking_date"]}
        emptyMessage="No bookings found"
        height="520px"
        rowActions={[
          viewRowAction((row) => {
            const href = portalRecordViewHref(ctx, row.id);
            if (href) router.push(href);
          }),
          editRowAction((row) => {
            const href = portalRecordEditHref(ctx, row.id);
            if (href) router.push(href);
          }),
          {
            id: "qr",
            label: "QR",
            icon: QrCode,
            variant: "outline",
            hidden: (row) =>
              !row.is_manual_booking ||
              !row.table_id ||
              !row.customer_id ||
              row.booking_status === "cancelled",
            onClick: (row) => setQrBooking(row),
          },
        ]}
      />
      <BookingQrDialog
        open={!!qrBooking}
        onOpenChange={(open) => {
          if (!open) setQrBooking(null);
        }}
        booking={qrBooking}
      />
    </>
  );
}

function RestaurantOrderMasterTable({ ctx }: { ctx: PortalChildContext }) {
  const router = useRouter();
  const query = useRestaurantScopeQuery(ctx);

  const fetchRows = useCallback(
    async (gridQuery: ListQueryPayload) => {
      return GetAllRestaurantOrderMasterList(
        mergeScopedListQuery(query, gridQuery)
      );
    },
    [query]
  );

  const columnDefs = useMemo<ColDef<RestaurantOrderMasterRow>[]>(
    () => [
      {
        field: "order_number",
        headerName: "Order #",
        minWidth: 90,
        valueFormatter: (p) =>
          p.value != null ? `#${p.value}` : "—",
      },
      {
        field: "customer_name",
        headerName: "Customer",
        minWidth: 150,
        flex: 1,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "floor_no",
        headerName: "Floor",
        minWidth: 90,
        valueFormatter: (p) =>
          p.value != null ? `Floor ${p.value}` : "—",
      },
      {
        field: "table_number",
        headerName: "Table",
        minWidth: 90,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "order_items_id",
        headerName: "Items",
        minWidth: 90,
        valueFormatter: (p) => {
          const items = p.value as number[] | undefined;
          if (!items?.length) return "0";
          return `${items.length} item${items.length === 1 ? "" : "s"}`;
        },
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 120,
        valueFormatter: (p) =>
          p.value ? formatOrderStatus(String(p.value)) : "—",
      },
      {
        field: "created_at",
        headerName: "Created",
        minWidth: 120,
        valueFormatter: (p) =>
          p.value ? formatDateDDMMYYYY(String(p.value)) || "—" : "—",
      },
    ],
    []
  );

  return (
    <DynamicTable<RestaurantOrderMasterRow>
      rowData={[]}
      columnDefs={columnDefs}
      onServerFilter={fetchRows}
      dateFields={["created_at"]}
      emptyMessage="No orders found"
      height="520px"
      rowActions={[
        viewRowAction((row) => {
          const href = portalRecordViewHref(ctx, row.id);
          if (href) router.push(href);
        }),
        editRowAction((row) => {
          const href = portalRecordEditHref(ctx, row.id);
          if (href) router.push(href);
        }),
      ]}
    />
  );
}

function ProjectRestaurantTable({ ctx }: { ctx: PortalChildContext }) {
  const router = useRouter();
  const query = useMemo(
    () => listQueryForProject(ctx.session.projectId),
    [ctx.session.projectId]
  );
  const [rows, setRows] = useState<RestaurantMasterRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    GetAllRestaurantsList(query)
      .then((r) => {
        setRows(r.rows);
        setTotal(r.total);
      })
      .catch(() => {
        setRows([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const columnDefs = useMemo<ColDef<RestaurantMasterRow>[]>(
    () => [
      {
        field: "restaurant_name",
        headerName: "Restaurant Name",
        minWidth: 160,
        flex: 1,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "owner_name",
        headerName: "Restaurant Owner Name",
        minWidth: 150,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "restaurant_mobile",
        headerName: "Restaurant Mobile",
        minWidth: 130,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "restaurant_email",
        headerName: "Restaurant Email",
        minWidth: 180,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "restaurant_address",
        headerName: "Restaurant Address",
        minWidth: 200,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 100,
        valueFormatter: (p) => {
          const v = String(p.value ?? "").toLowerCase();
          return v === "online" ? "Online" : v === "offline" ? "Offline" : v || "—";
        },
      },
    ],
    []
  );

  return (
    <DynamicTable<RestaurantMasterRow>
      rowData={rows}
      columnDefs={columnDefs}
      loading={loading}
      totalRowCount={total}
      emptyMessage={`No restaurants for ${ctx.session.projectName}`}
      height="520px"
      rowActions={[
        viewRowAction((row) => {
          const href = portalRecordViewHref(ctx, row.id);
          if (href) router.push(href);
        }),
      ]}
    />
  );
}

function ProjectPlansTrackerTable({ ctx }: { ctx: PortalChildContext }) {
  const query = useMemo(
    () => listQueryForProject(ctx.session.projectId),
    [ctx.session.projectId]
  );

  const fetchRows = useCallback(async () => {
    return GetAllPlansTrackerList(query);
  }, [query]);

  const columnDefs = useMemo<ColDef<PlansTrackerRow>[]>(
    () => [
      {
        field: "client_name",
        headerName: "Client",
        minWidth: 160,
        flex: 1,
        valueFormatter: (p) => p.value || "—",
      },
      { field: "username", headerName: "Username", minWidth: 130 },
      { field: "plan_type", headerName: "Plan Type", minWidth: 130 },
      {
        field: "plan_amount",
        headerName: "Amount",
        minWidth: 100,
        valueFormatter: (p) => {
          if (p.value == null) return "—";
          const n = Number(p.value);
          return Number.isFinite(n) ? `₹${n.toLocaleString()}` : String(p.value);
        },
      },
      {
        field: "plan_validity",
        headerName: "Validity",
        minWidth: 100,
        valueFormatter: (p) =>
          p.value != null ? `${p.value} days` : "—",
      },
      { field: "purchase_at", headerName: "Purchased At", minWidth: 150 },
    ],
    []
  );

  return (
    <DynamicTable<PlansTrackerRow>
      rowData={[]}
      columnDefs={columnDefs}
      onServerFilter={fetchRows}
      dateFields={["purchase_at"]}
      emptyMessage={`No plan purchases for ${ctx.session.projectName}`}
      height="520px"
    />
  );
}

function ProjectParentModuleTable({ ctx }: { ctx: PortalChildContext }) {
  const query = useMemo(
    () => listQueryForProject(ctx.session.projectId),
    [ctx.session.projectId]
  );

  const fetchRows = useCallback(async () => {
    return GetAllParentModulesList(query);
  }, [query]);

  const columnDefs = useMemo<ColDef<ParentModuleRow>[]>(
    () =>
      withStatusSetFilter([
        {
          field: "module_name",
          headerName: "Module Name",
          minWidth: 180,
          flex: 1,
        },
        { field: "status", headerName: "Status", minWidth: 120 },
        { field: "created_at", headerName: "Created At", minWidth: 160 },
      ]),
    []
  );

  return (
    <DynamicTable<ParentModuleRow>
      rowData={[]}
      columnDefs={columnDefs}
      onServerFilter={fetchRows}
      emptyMessage={`No parent modules for ${ctx.session.projectName}`}
      height="520px"
      rowActions={[
        deleteRowAction(async (row) => {
          await DeleteParentModule(row.id);
        }),
      ]}
    />
  );
}

function ProjectChildModuleTable({ ctx }: { ctx: PortalChildContext }) {
  const query = useMemo(
    () => listQueryForProject(ctx.session.projectId),
    [ctx.session.projectId]
  );

  const fetchRows = useCallback(async () => {
    return GetAllChildModulesList(query);
  }, [query]);

  const columnDefs = useMemo<ColDef<ChildModuleRow>[]>(
    () => [
      {
        field: "parent_module_name",
        headerName: "Parent Module",
        minWidth: 160,
        valueFormatter: (p: ValueFormatterParams<ChildModuleRow>) =>
          p.value || "—",
      },
      {
        field: "child_module_name",
        headerName: "Child Module",
        minWidth: 180,
        flex: 1,
      },
      { field: "created_at", headerName: "Created At", minWidth: 160 },
    ],
    []
  );

  return (
    <DynamicTable<ChildModuleRow>
      rowData={[]}
      columnDefs={columnDefs}
      onServerFilter={fetchRows}
      emptyMessage={`No child modules for ${ctx.session.projectName}`}
      height="520px"
      rowActions={[
        deleteRowAction(async (row) => {
          await DeleteChildModule(row.id);
        }),
      ]}
    />
  );
}

function PermissionTable({ ctx }: { ctx: PortalChildContext }) {
  const router = useRouter();
  const [rows, setRows] = useState<PermissionMasterRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    GetAllPermissionsList()
      .then((r) => setRows(r.rows))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columnDefs = useMemo<ColDef<PermissionMasterRow>[]>(
    () => [
      {
        field: "role_name",
        headerName: "Role",
        minWidth: 180,
        flex: 1,
        valueFormatter: (p: ValueFormatterParams<PermissionMasterRow>) => {
          const row = p.data;
          if (row?.role_name) {
            return row.role_code
              ? `${row.role_name} (${row.role_code})`
              : row.role_name;
          }
          return "—";
        },
      },
      { field: "created_at", headerName: "Created", minWidth: 160 },
    ],
    []
  );

  return (
    <DynamicTable<PermissionMasterRow>
      rowData={rows}
      columnDefs={columnDefs}
      loading={loading}
      totalRowCount={rows.length}
      emptyMessage="No permissions configured"
      height="520px"
      rowActions={[
        viewRowAction((row) =>
          router.push(
            portalChildPermissionPath(
              ctx.session.projectId,
              ctx.parentId,
              ctx.childId,
              row.id
            )
          )
        ),
        editRowAction((row) =>
          router.push(
            portalChildPermissionEditPath(
              ctx.session.projectId,
              ctx.parentId,
              ctx.childId,
              row.id
            )
          )
        ),
        deleteRowAction(async (row) => {
          await DeletePermission(row.id);
          load();
        }),
      ]}
    />
  );
}
