"use client";

import { useEffect, useMemo, useState } from "react";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildClientFormConfig,
  enrichClientFormData,
  mapClientToFormData,
  mapFormToClientPayload,
  mapFormToLoginPayload,
} from "@/lib/client-form-config";
import { loadClientFormOptions } from "@/lib/load-client-form-options";
import {
  buildPaymentTypeFormConfig,
  mapFormToPaymentTypePayload,
  mapPaymentTypeToFormData,
} from "@/lib/payment-type-form-config";
import {
  buildPlanFormConfig,
  enrichPlanFormData,
  findProjectIdForPlan,
  mapPlanToFormData,
  type ProjectListRow,
} from "@/lib/plan-form-config";
import { loadPlanFormOptions } from "@/lib/load-plan-form-options";
import {
  buildRoleFormConfig,
  enrichRoleFormData,
  mapFormToRolePayload,
  mapRoleToFormData,
} from "@/lib/role-form-config";
import { loadRoleFormOptions } from "@/lib/load-role-form-options";
import {
  buildTransactionFormConfig,
  enrichTransactionFormData,
  mapFormToTransactionPayload,
  mapTransactionToFormData,
} from "@/lib/transaction-form-config";
import { loadTransactionFormOptions } from "@/lib/load-transaction-form-options";
import { defaultListQuery } from "@/lib/list-query";
import type { PortalFeatureKey } from "@/restaurant-management-admin-panel/lib/module-registry";
import {
  GetClientById,
  UpdateClientManagement,
} from "@/services/api/client-management.api";
import {
  GetClientLoginById,
  UpdateClientLogin,
} from "@/services/api/client-login.api";
import {
  GetPaymentTypeById,
  UpdatePaymentType,
} from "@/services/api/payment-type.api";
import { GetPlanById, UpdatePlan } from "@/services/api/plans.api";
import { mapFormToPlanPayload } from "@/lib/plan-form-config";
import { GetAllProjectsList } from "@/services/api/projects.api";
import { GetRoleById, UpdateRole } from "@/services/api/roles.api";
import {
  GetTransactionById,
  UpdateTransaction,
} from "@/services/api/transactions.api";

interface PortalFeatureRecordProps {
  featureKey: PortalFeatureKey;
  recordId: string;
  mode: "view" | "edit";
  listPath: string;
  editPath: string;
  onCancel: () => void;
  onSaved: () => void;
  onEdit?: () => void;
}

export function PortalFeatureRecord({
  featureKey,
  recordId,
  mode,
  listPath,
  editPath,
  onCancel,
  onSaved,
  onEdit,
}: PortalFeatureRecordProps) {
  switch (featureKey) {
    case "client_management":
      return (
        <PortalClientRecord
          recordId={recordId}
          mode={mode}
          editPath={editPath}
          onCancel={onCancel}
          onSaved={onSaved}
          onEdit={onEdit}
        />
      );
    case "transaction_master":
      return (
        <PortalTransactionRecord
          recordId={recordId}
          mode={mode}
          editPath={editPath}
          onCancel={onCancel}
          onSaved={onSaved}
          onEdit={onEdit}
        />
      );
    case "payment_type_master":
      return (
        <PortalPaymentTypeRecord
          recordId={recordId}
          mode={mode}
          editPath={editPath}
          onCancel={onCancel}
          onSaved={onSaved}
          onEdit={onEdit}
        />
      );
    case "role_master":
      return (
        <PortalRoleRecord
          recordId={recordId}
          mode={mode}
          editPath={editPath}
          onCancel={onCancel}
          onSaved={onSaved}
          onEdit={onEdit}
        />
      );
    case "plans_master":
      return (
        <PortalPlanRecord
          recordId={recordId}
          mode={mode}
          editPath={editPath}
          onCancel={onCancel}
          onSaved={onSaved}
          onEdit={onEdit}
        />
      );
    default:
      return (
        <p className="text-sm text-muted-foreground">
          View and edit are not available for this module in the project portal.
          <button
            type="button"
            className="ml-1 text-primary underline"
            onClick={onCancel}
          >
            Back to list
          </button>
        </p>
      );
  }
}

function PortalClientRecord({
  recordId,
  mode,
  onCancel,
  onSaved,
  onEdit,
}: Omit<PortalFeatureRecordProps, "featureKey" | "listPath" | "editPath">) {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(
    null
  );
  const [formOptions, setFormOptions] = useState<
    Awaited<ReturnType<typeof loadClientFormOptions>>
  >({});
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([GetClientById(recordId), loadClientFormOptions()])
      .then(async ([client, options]) => {
        setFormOptions(options);
        let login = null;
        if (client.login_id) {
          try {
            login = await GetClientLoginById(client.login_id);
          } catch {
            login = null;
          }
        }
        setInitialData(
          enrichClientFormData(
            mapClientToFormData(client, login ?? undefined),
            options
          )
        );
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load client")
      )
      .finally(() => setLoading(false));
  }, [recordId]);

  const config = useMemo(
    () =>
      initialData
        ? buildClientFormConfig(mode, initialData, formOptions)
        : null,
    [initialData, formOptions, mode]
  );

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (!config) {
    return (
      <p className="text-sm text-muted-foreground">
        {loading ? "Loading client..." : "Client not found."}
      </p>
    );
  }

  return (
    <DynamicForm
      config={config}
      loading={loading}
      onSubmit={
        mode === "edit"
          ? async (data) => {
              const loginId = data.login_id ? Number(data.login_id) : null;
              if (loginId) {
                const loginPayload = mapFormToLoginPayload(data, true);
                if (loginPayload.password === "") {
                  delete loginPayload.password;
                }
                await UpdateClientLogin(loginId, loginPayload);
              }
              await UpdateClientManagement(
                recordId,
                mapFormToClientPayload(data, loginId)
              );
              onSaved();
            }
          : async () => {}
      }
      onCancel={onCancel}
      onEdit={mode === "view" ? onEdit ?? (() => {}) : undefined}
    />
  );
}

function PortalTransactionRecord({
  recordId,
  mode,
  onCancel,
  onSaved,
  onEdit,
}: Omit<PortalFeatureRecordProps, "featureKey" | "listPath" | "editPath">) {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([GetTransactionById(recordId), loadTransactionFormOptions()])
      .then(([row, options]) => {
        setInitialData(
          enrichTransactionFormData(mapTransactionToFormData(row), options)
        );
        setError("");
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load transaction"
        )
      )
      .finally(() => setLoading(false));
  }, [recordId]);

  const config = useMemo(
    () =>
      initialData ? buildTransactionFormConfig(mode, initialData) : null,
    [initialData, mode]
  );

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (!config) {
    return (
      <p className="text-sm text-muted-foreground">
        {loading ? "Loading transaction..." : "Transaction not found."}
      </p>
    );
  }

  return (
    <DynamicForm
      config={config}
      loading={loading}
      onSubmit={
        mode === "edit"
          ? async (data) => {
              await UpdateTransaction(
                recordId,
                mapFormToTransactionPayload(data)
              );
              onSaved();
            }
          : async () => {}
      }
      onCancel={onCancel}
      onEdit={mode === "view" ? onEdit : undefined}
    />
  );
}

function PortalPaymentTypeRecord({
  recordId,
  mode,
  onCancel,
  onSaved,
  onEdit,
}: Omit<PortalFeatureRecordProps, "featureKey" | "listPath" | "editPath">) {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    GetPaymentTypeById(recordId)
      .then((row) => {
        setInitialData(mapPaymentTypeToFormData(row));
        setError("");
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load payment type"
        )
      )
      .finally(() => setLoading(false));
  }, [recordId]);

  const config = useMemo(
    () =>
      initialData ? buildPaymentTypeFormConfig(mode, initialData) : null,
    [initialData, mode]
  );

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (!config) {
    return (
      <p className="text-sm text-muted-foreground">
        {loading ? "Loading payment type..." : "Payment type not found."}
      </p>
    );
  }

  return (
    <DynamicForm
      config={config}
      loading={loading}
      onSubmit={
        mode === "edit"
          ? async (data) => {
              await UpdatePaymentType(
                recordId,
                mapFormToPaymentTypePayload(data)
              );
              onSaved();
            }
          : async () => {}
      }
      onCancel={onCancel}
      onEdit={mode === "view" ? onEdit : undefined}
    />
  );
}

function PortalRoleRecord({
  recordId,
  mode,
  onCancel,
  onSaved,
  onEdit,
}: Omit<PortalFeatureRecordProps, "featureKey" | "listPath" | "editPath">) {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(
    null
  );
  const [formOptions, setFormOptions] = useState<
    Awaited<ReturnType<typeof loadRoleFormOptions>>
  >({});
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([GetRoleById(recordId), loadRoleFormOptions()])
      .then(([role, options]) => {
        setFormOptions(options);
        setInitialData(enrichRoleFormData(mapRoleToFormData(role), options));
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load role")
      )
      .finally(() => setLoading(false));
  }, [recordId]);

  const config = useMemo(
    () =>
      initialData
        ? buildRoleFormConfig(mode, initialData, formOptions)
        : null,
    [initialData, formOptions, mode]
  );

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (!config) {
    return (
      <p className="text-sm text-muted-foreground">
        {loading ? "Loading role..." : "Role not found."}
      </p>
    );
  }

  return (
    <DynamicForm
      config={config}
      loading={loading}
      onSubmit={
        mode === "edit"
          ? async (data) => {
              await UpdateRole(recordId, mapFormToRolePayload(data));
              onSaved();
            }
          : async () => {}
      }
      onCancel={onCancel}
      onEdit={mode === "view" ? onEdit : undefined}
    />
  );
}

function PortalPlanRecord({
  recordId,
  mode,
  onCancel,
  onSaved,
  onEdit,
}: Omit<PortalFeatureRecordProps, "featureKey" | "listPath" | "editPath">) {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(
    null
  );
  const [formOptions, setFormOptions] = useState<
    Awaited<ReturnType<typeof loadPlanFormOptions>>
  >({});
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      GetPlanById(recordId),
      loadPlanFormOptions(),
      GetAllProjectsList(defaultListQuery),
    ])
      .then(([plan, options, projectData]) => {
        setFormOptions(options);
        const projects = projectData.rows as ProjectListRow[];
        const projectId = findProjectIdForPlan(
          projects,
          plan.id,
          plan.project_id
        );
        const projectName =
          plan.project_name ??
          projects.find((p) => String(p.id) === projectId)?.name ??
          "";
        setInitialData(
          enrichPlanFormData(
            mapPlanToFormData(plan, projectId, projectName),
            options
          )
        );
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load plan")
      )
      .finally(() => setLoading(false));
  }, [recordId]);

  const config = useMemo(
    () =>
      initialData ? buildPlanFormConfig(mode, initialData, formOptions) : null,
    [initialData, formOptions, mode]
  );

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (!config) {
    return (
      <p className="text-sm text-muted-foreground">
        {loading ? "Loading plan..." : "Plan not found."}
      </p>
    );
  }

  return (
    <DynamicForm
      config={config}
      loading={loading}
      onSubmit={
        mode === "edit"
          ? async (data) => {
              await UpdatePlan(recordId, mapFormToPlanPayload(data));
              onSaved();
            }
          : async () => {}
      }
      onCancel={onCancel}
      onEdit={mode === "view" ? onEdit : undefined}
    />
  );
}
