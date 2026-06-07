"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildClientFormConfig,
  getEmptyClientFormData,
  mapFormToClientPayload,
  mapFormToLoginPayload,
} from "@/lib/client-form-config";
import { loadClientFormOptions } from "@/lib/load-client-form-options";
import { loadTransactionFormOptions } from "@/lib/load-transaction-form-options";
import {
  buildTransactionFormConfig,
  getEmptyTransactionFormData,
  mapFormToTransactionPayload,
} from "@/lib/transaction-form-config";
import type { PortalChildContext } from "@/restaurant-management-admin-panel/hooks/use-portal-child-module";
import {
  getPortalFeaturePaths,
  resolveEffectivePortalFeature,
  type PortalFeatureKey,
} from "@/restaurant-management-admin-panel/lib/module-registry";
import { PortalMenuForm } from "@/restaurant-management-admin-panel/features/portal-feature-menu";
import { PortalBookingForm } from "@/restaurant-management-admin-panel/features/portal-feature-booking";
import { PortalOrderForm } from "@/restaurant-management-admin-panel/features/portal-feature-order";
import {
  PortalFloorForm,
  PortalTableForm,
} from "@/restaurant-management-admin-panel/features/portal-feature-floor-table";
import {
  PortalPaymentForm,
  PortalTransactionForm,
} from "@/restaurant-management-admin-panel/features/portal-feature-transaction-payment";
import { resolveRestaurantId } from "@/restaurant-management-admin-panel/lib/restaurant-portal-scope";
import { CreateClientManagement } from "@/services/api/client-management.api";
import { CreateClientLogin } from "@/services/api/client-login.api";
import { CreateTransaction } from "@/services/api/transactions.api";
import { CreatePaymentType } from "@/services/api/payment-type.api";
import {
  buildPaymentTypeFormConfig,
  getEmptyPaymentTypeFormData,
  mapFormToPaymentTypePayload,
} from "@/lib/payment-type-form-config";
import { CreatePermission } from "@/services/api/permissions.api";
import { PermissionForm } from "@/components/permission/PermissionForm";
import {
  buildEmptyModulesMap,
  loadPermissionModuleRows,
} from "@/lib/permission-modules";
import { defaultListQuery } from "@/lib/list-query";
import { GetAllPermissionsList } from "@/services/api/permissions.api";
import { GetAllRolesList } from "@/services/api/roles.api";
import type { ModulesPermissionMap } from "@/types/permission-master.types";
import {
  buildRoleFormConfig,
  getEmptyRoleFormData,
  mapFormToRolePayload,
} from "@/lib/role-form-config";
import { loadRoleFormOptions } from "@/lib/load-role-form-options";
import { CreateRole } from "@/services/api/roles.api";
import { CreatePlan } from "@/services/api/plans.api";
import { loadPlanFormOptions } from "@/lib/load-plan-form-options";
import {
  buildPlanFormConfig,
  getEmptyPlanFormData,
  mapFormToPlanPayload,
} from "@/lib/plan-form-config";
import { CreateRestaurant } from "@/services/api/restaurant-master.api";
import {
  buildRestaurantFormConfig,
  getEmptyRestaurantFormData,
  mapFormToRestaurantLoginPayload,
  mapFormToRestaurantPayload,
} from "@/restaurant-management-admin-panel/lib/restaurant-master-form-config";
import {
  buildParentModuleFormConfig,
  getEmptyParentModuleFormData,
  mapFormToParentModulePayload,
} from "@/lib/parent-module-form-config";
import {
  buildChildModuleFormConfig,
  getEmptyChildModuleFormData,
  mapFormToChildModulePayload,
} from "@/lib/child-module-form-config";
import { listQueryForProject } from "@/restaurant-management-admin-panel/lib/project-filters";
import { ProjectEmployeeMasterCreate } from "@/restaurant-management-admin-panel/features/project-employee-master";
import { CreateParentModule } from "@/services/api/parent-modules.api";
import { CreateChildModule } from "@/services/api/child-modules.api";
import { GetAllParentModulesList } from "@/services/api/parent-modules.api";
import { refreshActivePortalSession } from "@/lib/refresh-portal-session";
import { useAuth } from "@/store";
import { useProjectPortal } from "@/store/project-portal";
import type { DynamicSelectOption } from "@/types/dynamic-form.types";

interface PortalFeatureCreateProps {
  ctx: PortalChildContext;
}

export function PortalFeatureCreate({ ctx }: PortalFeatureCreateProps) {
  const router = useRouter();
  const { user } = useAuth();
  const restaurantId = resolveRestaurantId(ctx.session, user);
  const paths = getPortalFeaturePaths(
    ctx.session.projectId,
    ctx.parentId,
    ctx.childId
  );
  const effectiveFeature = resolveEffectivePortalFeature(
    ctx.childName,
    ctx.feature,
    ctx.session
  );
  const { featureKey } = effectiveFeature;

  const goBack = () => router.push(paths.list);

  switch (featureKey as PortalFeatureKey) {
    case "menu_master":
    case "restaurant_floor_master":
    case "restaurant_table_master":
    case "restaurant_booking_master":
    case "restaurant_order_master":
    case "restaurant_transaction_master":
    case "restaurant_payment_master":
      if (!restaurantId) {
        return (
          <p className="text-sm text-muted-foreground">
            Open a restaurant portal (Check Restaurant) to manage this module.
          </p>
        );
      }
      if (featureKey === "restaurant_floor_master") {
        return (
          <PortalFloorForm
            mode="create"
            restaurantId={restaurantId}
            onDone={goBack}
            onCancel={goBack}
          />
        );
      }
      if (featureKey === "restaurant_table_master") {
        return (
          <PortalTableForm
            mode="create"
            restaurantId={restaurantId}
            onDone={goBack}
            onCancel={goBack}
          />
        );
      }
      if (featureKey === "restaurant_booking_master") {
        return (
          <PortalBookingForm
            mode="create"
            restaurantId={restaurantId}
            onDone={goBack}
            onCancel={goBack}
          />
        );
      }
      if (featureKey === "restaurant_order_master") {
        return (
          <PortalOrderForm
            mode="create"
            restaurantId={restaurantId}
            onDone={goBack}
            onCancel={goBack}
          />
        );
      }
      if (featureKey === "restaurant_transaction_master") {
        return (
          <PortalTransactionForm
            mode="create"
            restaurantId={restaurantId}
            onDone={goBack}
            onCancel={goBack}
          />
        );
      }
      if (featureKey === "restaurant_payment_master") {
        return (
          <PortalPaymentForm
            mode="create"
            restaurantId={restaurantId}
            onDone={goBack}
            onCancel={goBack}
          />
        );
      }
      return (
        <PortalMenuForm
          mode="create"
          restaurantId={restaurantId}
          onDone={goBack}
          onCancel={goBack}
        />
      );
    case "client_management":
      return <PortalCreateClient ctx={ctx} onDone={goBack} onCancel={goBack} />;
    case "transaction_master":
      return (
        <PortalCreateTransaction ctx={ctx} onDone={goBack} onCancel={goBack} />
      );
    case "payment_type_master":
      return (
        <PortalCreatePaymentType ctx={ctx} onDone={goBack} onCancel={goBack} />
      );
    case "role_master":
      return <PortalCreateRole ctx={ctx} onDone={goBack} onCancel={goBack} />;
    case "plans_master":
      return <PortalCreatePlan ctx={ctx} onDone={goBack} onCancel={goBack} />;
    case "restaurant_master":
      return (
        <PortalCreateRestaurant ctx={ctx} onDone={goBack} onCancel={goBack} />
      );
    case "permission_master":
      return (
        <PortalCreatePermission ctx={ctx} onDone={goBack} onCancel={goBack} />
      );
    case "parent_modules":
      return (
        <PortalCreateParentModule ctx={ctx} onDone={goBack} onCancel={goBack} />
      );
    case "child_modules":
      return (
        <PortalCreateChildModule ctx={ctx} onDone={goBack} onCancel={goBack} />
      );
    case "employee_master":
      return (
        <PortalCreateEmployee ctx={ctx} onDone={goBack} onCancel={goBack} />
      );
    default:
      return (
        <p className="text-sm text-muted-foreground">
          Create is not available for &quot;{ctx.childName}&quot; in this project portal.
        </p>
      );
  }
}

function PortalCreateClient({
  ctx,
  onDone,
  onCancel,
}: {
  ctx: PortalChildContext;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [formOptions, setFormOptions] = useState<
    Awaited<ReturnType<typeof loadClientFormOptions>>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientFormOptions()
      .then(setFormOptions)
      .finally(() => setLoading(false));
  }, []);

  const initialData = useMemo(() => {
    const base = getEmptyClientFormData();
    return {
      ...base,
      project_id: String(ctx.session.projectId),
      _project_label: ctx.session.projectName,
    };
  }, [ctx.session.projectId, ctx.session.projectName]);

  const config = useMemo(
    () => buildClientFormConfig("create", initialData, formOptions),
    [formOptions, initialData]
  );

  if (loading) {
    return <Loader2 className="size-5 animate-spin text-muted-foreground" />;
  }

  return (
    <DynamicForm
      config={config}
      onSubmit={async (data) => {
        const loginRow = (await CreateClientLogin(
          mapFormToLoginPayload(data)
        )) as { id: number };
        await CreateClientManagement(
          mapFormToClientPayload(data, loginRow.id)
        );
        onDone();
      }}
      onCancel={onCancel}
    />
  );
}

function PortalCreateTransaction({
  ctx,
  onDone,
  onCancel,
}: {
  ctx: PortalChildContext;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [formOptions, setFormOptions] = useState<
    Awaited<ReturnType<typeof loadTransactionFormOptions>>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactionFormOptions()
      .then(setFormOptions)
      .finally(() => setLoading(false));
  }, []);

  const initialData = useMemo(() => {
    const base = getEmptyTransactionFormData();
    return {
      ...base,
      project_id: String(ctx.session.projectId),
      _project_label: ctx.session.projectName,
    };
  }, [ctx.session.projectId, ctx.session.projectName]);

  const config = useMemo(
    () => buildTransactionFormConfig("create", initialData, formOptions),
    [formOptions, initialData]
  );

  if (loading) {
    return <Loader2 className="size-5 animate-spin text-muted-foreground" />;
  }

  return (
    <DynamicForm
      config={config}
      onSubmit={async (data) => {
        await CreateTransaction(mapFormToTransactionPayload(data));
        onDone();
      }}
      onCancel={onCancel}
    />
  );
}

function PortalCreatePaymentType({
  onDone,
  onCancel,
}: {
  ctx: PortalChildContext;
  onDone: () => void;
  onCancel: () => void;
}) {
  const config = useMemo(
    () => buildPaymentTypeFormConfig("create", getEmptyPaymentTypeFormData()),
    []
  );

  return (
    <DynamicForm
      config={config}
      onSubmit={async (data) => {
        await CreatePaymentType(mapFormToPaymentTypePayload(data));
        onDone();
      }}
      onCancel={onCancel}
    />
  );
}

function PortalCreateRole({
  ctx,
  onDone,
  onCancel,
}: {
  ctx: PortalChildContext;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [formOptions, setFormOptions] = useState<
    Awaited<ReturnType<typeof loadRoleFormOptions>>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoleFormOptions()
      .then(setFormOptions)
      .finally(() => setLoading(false));
  }, []);

  const initialData = useMemo(() => {
    const base = getEmptyRoleFormData();
    return {
      ...base,
      project_ids: [String(ctx.session.projectId)],
      _projects_label: ctx.session.projectName,
    };
  }, [ctx.session.projectId, ctx.session.projectName]);

  const config = useMemo(
    () => buildRoleFormConfig("create", initialData, formOptions),
    [formOptions, initialData]
  );

  if (loading) {
    return <Loader2 className="size-5 animate-spin text-muted-foreground" />;
  }

  return (
    <DynamicForm
      config={config}
      onSubmit={async (data) => {
        await CreateRole(mapFormToRolePayload(data));
        onDone();
      }}
      onCancel={onCancel}
    />
  );
}

function PortalCreateRestaurant({
  ctx,
  onDone,
  onCancel,
}: {
  ctx: PortalChildContext;
  onDone: () => void;
  onCancel: () => void;
}) {
  const initialData = useMemo(
    () => ({
      ...getEmptyRestaurantFormData(),
      project_id: String(ctx.session.projectId),
      _project_label: ctx.session.projectName,
    }),
    [ctx.session.projectId, ctx.session.projectName]
  );

  const config = useMemo(
    () => buildRestaurantFormConfig("create", initialData),
    [initialData]
  );

  return (
    <DynamicForm
      config={config}
      onSubmit={async (data) => {
        const loginRow = (await CreateClientLogin(
          mapFormToRestaurantLoginPayload(data)
        )) as { id: number };
        await CreateRestaurant({
          ...mapFormToRestaurantPayload(data),
          project_id: ctx.session.projectId,
          created_by: loginRow.id,
        });
        onDone();
      }}
      onCancel={onCancel}
    />
  );
}

function PortalCreatePlan({
  ctx,
  onDone,
  onCancel,
}: {
  ctx: PortalChildContext;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [formOptions, setFormOptions] = useState<
    Awaited<ReturnType<typeof loadPlanFormOptions>>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlanFormOptions()
      .then(setFormOptions)
      .finally(() => setLoading(false));
  }, []);

  const initialData = useMemo(() => {
    const base = getEmptyPlanFormData();
    return {
      ...base,
      project_id: String(ctx.session.projectId),
      _project_label: ctx.session.projectName,
    };
  }, [ctx.session.projectId, ctx.session.projectName]);

  const config = useMemo(
    () => buildPlanFormConfig("create", initialData, formOptions),
    [formOptions, initialData]
  );

  if (loading) {
    return <Loader2 className="size-5 animate-spin text-muted-foreground" />;
  }

  return (
    <DynamicForm
      config={config}
      onSubmit={async (data) => {
        await CreatePlan(mapFormToPlanPayload(data));
        onDone();
      }}
      onCancel={onCancel}
    />
  );
}

function PortalCreateParentModule({
  ctx,
  onDone,
  onCancel,
}: {
  ctx: PortalChildContext;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const { enterPortal } = useProjectPortal();

  const initialData = useMemo(
    () => ({
      ...getEmptyParentModuleFormData(),
      project_id: String(ctx.session.projectId),
      _project_label: ctx.session.projectName,
    }),
    [ctx.session.projectId, ctx.session.projectName]
  );

  const config = useMemo(
    () => buildParentModuleFormConfig("create", initialData),
    [initialData]
  );

  return (
    <DynamicForm
      config={config}
      onSubmit={async (data) => {
        await CreateParentModule(mapFormToParentModulePayload(data));
        const refreshed = await refreshActivePortalSession(ctx.session, user);
        enterPortal(refreshed);
        onDone();
      }}
      onCancel={onCancel}
    />
  );
}

function PortalCreateChildModule({
  ctx,
  onDone,
  onCancel,
}: {
  ctx: PortalChildContext;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const { enterPortal } = useProjectPortal();
  const [parentOptions, setParentOptions] = useState<DynamicSelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetAllParentModulesList(listQueryForProject(ctx.session.projectId))
      .then((result) => {
        setParentOptions(
          result.rows.map((row) => ({
            label: row.module_name,
            value: String(row.id),
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [ctx.session.projectId]);

  const initialData = useMemo(() => getEmptyChildModuleFormData(), []);

  const config = useMemo(() => {
    const base = buildChildModuleFormConfig("create", initialData);
    return {
      ...base,
      sections: base.sections.map((section) => ({
        ...section,
        fields: section.fields.map((field) =>
          field.name === "parent_module_id"
            ? { ...field, type: "select" as const, options: parentOptions }
            : field
        ),
      })),
    };
  }, [initialData, parentOptions]);

  if (loading) {
    return <Loader2 className="size-5 animate-spin text-muted-foreground" />;
  }

  return (
    <DynamicForm
      config={config}
      onSubmit={async (data) => {
        await CreateChildModule(mapFormToChildModulePayload(data));
        const refreshed = await refreshActivePortalSession(ctx.session, user);
        enterPortal(refreshed);
        onDone();
      }}
      onCancel={onCancel}
    />
  );
}

function PortalCreateEmployee({
  ctx,
  onDone,
  onCancel,
}: {
  ctx: PortalChildContext;
  onDone: () => void;
  onCancel: () => void;
}) {
  return (
    <ProjectEmployeeMasterCreate
      projectId={ctx.session.projectId}
      projectName={ctx.session.projectName}
      onDone={onDone}
      onCancel={onCancel}
    />
  );
}

function PortalCreatePermission({
  onDone,
  onCancel,
}: {
  ctx: PortalChildContext;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [moduleRows, setModuleRows] = useState<
    Awaited<ReturnType<typeof loadPermissionModuleRows>>
  >([]);
  const [roles, setRoles] = useState<
    { id: number; role_name: string; role_code?: string }[]
  >([]);
  const [usedRoleIds, setUsedRoleIds] = useState<number[]>([]);
  const [roleId, setRoleId] = useState<number | "">("");
  const [modules, setModules] = useState<ModulesPermissionMap>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      loadPermissionModuleRows(),
      GetAllRolesList(defaultListQuery),
      GetAllPermissionsList(defaultListQuery),
    ])
      .then(([catalog, rolesResult, permissionsResult]) => {
        setModuleRows(catalog);
        setRoles(rolesResult.rows);
        setUsedRoleIds(permissionsResult.rows.map((p) => p.role_id));
        setModules(buildEmptyModulesMap(catalog));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PermissionForm
      mode="create"
      loading={loading}
      submitting={submitting}
      moduleRows={moduleRows}
      roles={roles}
      roleId={roleId}
      modules={modules}
      usedRoleIds={usedRoleIds}
      onRoleChange={setRoleId}
      onModulesChange={setModules}
      onCancel={onCancel}
      onSubmit={async () => {
        if (!roleId) return;
        setSubmitting(true);
        try {
          await CreatePermission({ role_id: roleId, modules });
          onDone();
        } finally {
          setSubmitting(false);
        }
      }}
    />
  );
}
