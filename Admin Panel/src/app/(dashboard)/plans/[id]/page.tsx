"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildPlanFormConfig,
  findProjectIdForPlan,
  enrichPlanFormData,
  mapPlanToFormData,
  type ProjectListRow,
} from "@/lib/plan-form-config";
import { loadPlanFormOptions } from "@/lib/load-plan-form-options";
import { GetPlanById } from "@/services/api/plans.api";
import { GetAllProjectsList } from "@/services/api/projects.api";
import { defaultListQuery } from "@/lib/list-query";

export default function ViewPlanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
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
      GetPlanById(id),
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
  }, [id]);

  const config = useMemo(
    () =>
      initialData ? buildPlanFormConfig("view", initialData, formOptions) : null,
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
        {loading ? "Loading plan..." : "Plan not found."}
      </p>
    );
  }

  return (
    <DynamicForm
      config={config}
      loading={loading}
      onSubmit={async () => {}}
      onCancel={() => router.push("/plans")}
      onEdit={() => router.push(`/plans/${id}/edit`)}
    />
  );
}
