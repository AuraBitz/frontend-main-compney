"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildChildModuleFormConfig,
  getEmptyChildModuleFormData,
  mapFormToChildModulePayload,
} from "@/lib/child-module-form-config";
import { CreateChildModule } from "@/services/api/child-modules.api";

export default function CreateChildModulePage() {
  const router = useRouter();
  const config = useMemo(
    () => buildChildModuleFormConfig("create", getEmptyChildModuleFormData()),
    []
  );

  return (
    <DynamicForm
      config={config}
      onSubmit={async (data) => {
        await CreateChildModule(mapFormToChildModulePayload(data));
        router.push("/child-modules");
      }}
      onCancel={() => router.push("/child-modules")}
    />
  );
}
