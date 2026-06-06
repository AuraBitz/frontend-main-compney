"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildChildModuleFormConfig,
  mapChildModuleToFormData,
} from "@/lib/child-module-form-config";
import { GetChildModuleById } from "@/services/api/child-modules.api";

export default function ViewChildModulePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    GetChildModuleById(id)
      .then((row) => {
        setInitialData(mapChildModuleToFormData(row));
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load module")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const config = useMemo(
    () =>
      initialData ? buildChildModuleFormConfig("view", initialData) : null,
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
      onCancel={() => router.push("/child-modules")}
      onEdit={() => router.push(`/child-modules/${id}/edit`)}
    />
  );
}
