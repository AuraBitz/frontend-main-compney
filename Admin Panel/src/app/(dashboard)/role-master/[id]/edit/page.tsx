"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildRoleFormConfig,
  enrichRoleFormData,
  mapFormToRolePayload,
  mapRoleToFormData,
} from "@/lib/role-form-config";
import { loadRoleFormOptions } from "@/lib/load-role-form-options";
import { GetRoleById, UpdateRole } from "@/services/api/roles.api";

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(
    null
  );
  const [formOptions, setFormOptions] = useState<
    Awaited<ReturnType<typeof loadRoleFormOptions>>
  >({});
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([GetRoleById(id), loadRoleFormOptions()])
      .then(([role, options]) => {
        setFormOptions(options);
        setInitialData(enrichRoleFormData(mapRoleToFormData(role), options));
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load role")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const config = useMemo(
    () =>
      initialData ? buildRoleFormConfig("edit", initialData, formOptions) : null,
    [initialData, formOptions]
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
      onSubmit={async (data) => {
        await UpdateRole(id, mapFormToRolePayload(data));
        router.push("/role-master");
      }}
      onCancel={() => router.push("/role-master")}
    />
  );
}
