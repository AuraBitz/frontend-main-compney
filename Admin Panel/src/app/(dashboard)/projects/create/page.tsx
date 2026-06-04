"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildProjectFormConfig,
  getEmptyProjectFormData,
  mapFormToProjectPayload,
} from "@/lib/project-form-config";
import { loadProjectFormOptions } from "@/lib/load-project-form-options";
import { CreateProject } from "@/services/api/projects.api";

export default function CreateProjectPage() {
  const router = useRouter();
  const [formOptions, setFormOptions] = useState<
    Awaited<ReturnType<typeof loadProjectFormOptions>>
  >({});
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    loadProjectFormOptions()
      .then(setFormOptions)
      .finally(() => setOptionsLoading(false));
  }, []);

  const config = useMemo(
    () =>
      buildProjectFormConfig("create", getEmptyProjectFormData(), formOptions),
    [formOptions]
  );

  return (
    <DynamicForm
      config={config}
      loading={optionsLoading}
      onSubmit={async (data) => {
        await CreateProject(mapFormToProjectPayload(data));
        router.push("/projects");
      }}
      onCancel={() => router.push("/projects")}
    />
  );
}
