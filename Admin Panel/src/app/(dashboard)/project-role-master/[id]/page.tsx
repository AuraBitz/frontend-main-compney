"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildProjectRoleFormConfig,
  mapProjectRoleToFormData,
} from "@/lib/project-role-form-config";
import { GetProjectRoleById } from "@/services/api/project-role-master.api";

export default function ViewProjectRolePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    GetProjectRoleById(id)
      .then((row) => {
        setInitialData(mapProjectRoleToFormData(row));
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load role")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const config = useMemo(
    () =>
      initialData ? buildProjectRoleFormConfig("view", initialData) : null,
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
        {loading ? "Loading role..." : "Role not found."}
      </p>
    );
  }

  return (
    <DynamicForm
      config={config}
      loading={loading}
      onSubmit={async () => {}}
      onCancel={() => router.push("/project-role-master")}
      onEdit={() => router.push(`/project-role-master/${id}/edit`)}
    />
  );
}
