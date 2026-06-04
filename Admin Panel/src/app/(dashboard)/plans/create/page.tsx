"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildPlanFormConfig,
  getEmptyPlanFormData,
  mapFormToPlanPayload,
} from "@/lib/plan-form-config";
import { loadPlanFormOptions } from "@/lib/load-plan-form-options";
import { CreatePlan } from "@/services/api/plans.api";

export default function CreatePlanPage() {
  const router = useRouter();
  const [formOptions, setFormOptions] = useState<
    Awaited<ReturnType<typeof loadPlanFormOptions>>
  >({});
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    loadPlanFormOptions()
      .then(setFormOptions)
      .finally(() => setOptionsLoading(false));
  }, []);

  const config = useMemo(
    () => buildPlanFormConfig("create", getEmptyPlanFormData(), formOptions),
    [formOptions]
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
