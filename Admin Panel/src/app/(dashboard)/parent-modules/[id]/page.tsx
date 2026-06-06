"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildParentModuleFormConfig,
  mapParentModuleToFormData,
} from "@/lib/parent-module-form-config";
import { GetParentModuleById } from "@/services/api/parent-modules.api";

export default function ViewParentModulePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    GetParentModuleById(id)
      .then((row) => {
        setInitialData(mapParentModuleToFormData(row));
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load module")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const config = useMemo(
    () =>
      initialData ? buildParentModuleFormConfig("view", initialData) : null,
    [initialData]
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
        {loading ? "Loading..." : "Module not found."}
      </p>
    );
  }

  return (
    <DynamicForm
      config={config}
      loading={loading}
      onSubmit={async () => {}}
      onCancel={() => router.push("/parent-modules")}
      onEdit={() => router.push(`/parent-modules/${id}/edit`)}
    />
  );
}
