"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildPlanFormConfig,
  enrichPlanFormData,
  getEmptyPlanFormData,
  mapFormToPlanPayload,
} from "@/lib/plan-form-config";
import { loadPlanFormOptions } from "@/lib/load-plan-form-options";
import { CreatePlan } from "@/services/api/plans.api";

export default function CreatePlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultProjectId = searchParams.get("project_id") ?? "";
  const [formOptions, setFormOptions] = useState<
    Awaited<ReturnType<typeof loadPlanFormOptions>>
  >({});
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    loadPlanFormOptions()
      .then((options) =>
        setFormOptions({
          ...options,
          defaultProjectId,
        })
      )
      .finally(() => setOptionsLoading(false));
  }, [defaultProjectId]);

  const initialData = useMemo(
    () =>
      enrichPlanFormData(getEmptyPlanFormData(defaultProjectId), {
        ...formOptions,
        defaultProjectId,
      }),
    [defaultProjectId, formOptions]
  );

  const config = useMemo(
    () => buildPlanFormConfig("create", initialData, formOptions),
    [formOptions, initialData]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    await CreatePlan(mapFormToPlanPayload(data));
    router.push("/plans");
  };

  return (
    <DynamicForm
      config={config}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/plans")}
      loading={optionsLoading}
    />
  );
}
