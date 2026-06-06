"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildProjectPermissionFormConfig,
  getEmptyProjectPermissionFormData,
  mapFormToProjectPermissionPayload,
} from "@/lib/project-permission-form-config";
import { loadProjectPermissionFormOptions } from "@/lib/load-project-permission-form-options";
import { CreateProjectPermission } from "@/services/api/project-permission-master.api";

export default function CreateProjectPermissionPage() {
  const router = useRouter();
  const [formOptions, setFormOptions] = useState<
    Awaited<ReturnType<typeof loadProjectPermissionFormOptions>>
  >({});
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    loadProjectPermissionFormOptions()
      .then(setFormOptions)
      .finally(() => setOptionsLoading(false));
  }, []);

  const config = useMemo(
    () =>
      buildProjectPermissionFormConfig(
        "create",
        getEmptyProjectPermissionFormData(),
        formOptions
      ),
    [formOptions]
  );

  return (
    <DynamicForm
      config={config}
      loading={optionsLoading}
      onSubmit={async (data) => {
        await CreateProjectPermission(mapFormToProjectPermissionPayload(data));
        router.push("/project-permission-master");
      }}
      onCancel={() => router.push("/project-permission-master")}
    />
  );
}
