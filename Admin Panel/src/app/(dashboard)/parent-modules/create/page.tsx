"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildParentModuleFormConfig,
  getEmptyParentModuleFormData,
  mapFormToParentModulePayload,
} from "@/lib/parent-module-form-config";
import { CreateParentModule } from "@/services/api/parent-modules.api";

export default function CreateParentModulePage() {
  const router = useRouter();
  const config = useMemo(
    () => buildParentModuleFormConfig("create", getEmptyParentModuleFormData()),
    []
  );

  return (
    <DynamicForm
      config={config}
      onSubmit={async (data) => {
        await CreateParentModule(mapFormToParentModulePayload(data));
        router.push("/parent-modules");
      }}
      onCancel={() => router.push("/parent-modules")}
    />
  );
}
