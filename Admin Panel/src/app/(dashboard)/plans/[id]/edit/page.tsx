"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildPlanFormConfig,
  findProjectIdForPlan,
  mapFormToPlanPayload,
  enrichPlanFormData,
  mapPlanToFormData,
  type ProjectListRow,
} from "@/lib/plan-form-config";
import { loadPlanFormOptions } from "@/lib/load-plan-form-options";
import { GetPlanById, UpdatePlan } from "@/services/api/plans.api";
import { GetAllProjectsList } from "@/services/api/projects.api";
import { defaultListQuery } from "@/lib/list-query";

export default function EditPlanPage() {
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
  const [projects, setProjects] = useState<ProjectListRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      GetPlanById(id),
      loadPlanFormOptions(),
      GetAllProjectsList(defaultListQuery),
    ])
      .then(([plan, options, projectData]) => {
        setFormOptions(options);
        const projectRows = projectData.rows as ProjectListRow[];
        setProjects(projectRows);
        const projectIdStr = findProjectIdForPlan(
          projectRows,
          plan.id,
          plan.project_id
        );
        const projectName =
          plan.project_name ??
          projectRows.find((p) => String(p.id) === projectIdStr)?.name ??
          "";
        setInitialData(
          enrichPlanFormData(
            mapPlanToFormData(plan, projectIdStr, projectName),
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
      initialData ? buildPlanFormConfig("edit", initialData, formOptions) : null,
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
      onSubmit={async (data) => {
        await UpdatePlan(id, mapFormToPlanPayload(data));
        router.push("/plans");
      }}
      onCancel={() => router.push("/plans")}
    />
  );
}
