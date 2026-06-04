"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildProjectFormConfig,
  enrichProjectFormData,
  mapProjectToFormData,
} from "@/lib/project-form-config";
import { loadProjectFormOptions } from "@/lib/load-project-form-options";
import { GetProjectById } from "@/services/api/projects.api";

export default function ViewProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(
    null
  );
  const [formOptions, setFormOptions] = useState<
    Awaited<ReturnType<typeof loadProjectFormOptions>>
  >({});
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([GetProjectById(id), loadProjectFormOptions()])
      .then(([project, options]) => {
        setFormOptions(options);
        setInitialData(
          enrichProjectFormData(mapProjectToFormData(project), options)
        );
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load project")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const config = useMemo(
    () =>
      initialData
        ? buildProjectFormConfig("view", initialData, formOptions)
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
        {loading ? "Loading project..." : "Project not found."}
      </p>
    );
  }

  return (
    <DynamicForm
      config={config}
      loading={loading}
      onSubmit={async () => {}}
      onCancel={() => router.push("/projects")}
      onEdit={() => router.push(`/projects/${id}/edit`)}
    />
  );
}
