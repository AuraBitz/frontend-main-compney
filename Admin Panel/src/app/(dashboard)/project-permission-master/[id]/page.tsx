"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildProjectPermissionFormConfig,
  enrichProjectPermissionFormData,
  mapProjectPermissionToFormData,
} from "@/lib/project-permission-form-config";
import { loadProjectPermissionFormOptions } from "@/lib/load-project-permission-form-options";
import { GetProjectPermissionById } from "@/services/api/project-permission-master.api";

export default function ViewProjectPermissionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(
    null
  );
  const [formOptions, setFormOptions] = useState<
    Awaited<ReturnType<typeof loadProjectPermissionFormOptions>>
  >({});
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      GetProjectPermissionById(id),
      loadProjectPermissionFormOptions(Number(id)),
    ])
      .then(([row, options]) => {
        setFormOptions(options);
        setInitialData(
          enrichProjectPermissionFormData(
            mapProjectPermissionToFormData(row),
            options
          )
        );
        setError("");
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load project permission"
        )
      )
      .finally(() => setLoading(false));
  }, [id]);

  const config = useMemo(
    () =>
      initialData
        ? buildProjectPermissionFormConfig("view", initialData, formOptions)
        : null,
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
        {loading ? "Loading permission..." : "Permission not found."}
      </p>
    );
  }

  return (
    <DynamicForm
      config={config}
      loading={loading}
      onSubmit={async () => {}}
      onCancel={() => router.push("/project-permission-master")}
      onEdit={() => router.push(`/project-permission-master/${id}/edit`)}
    />
  );
}
