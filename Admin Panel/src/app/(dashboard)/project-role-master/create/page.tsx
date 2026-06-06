"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildProjectRoleFormConfig,
  getEmptyProjectRoleFormData,
  mapFormToProjectRolePayload,
} from "@/lib/project-role-form-config";
import { CreateProjectRole } from "@/services/api/project-role-master.api";

export default function CreateProjectRolePage() {
  const router = useRouter();
  const config = useMemo(
    () => buildProjectRoleFormConfig("create", getEmptyProjectRoleFormData()),
    []
  );

  return (
    <DynamicForm
      config={config}
      onSubmit={async (data) => {
        await CreateProjectRole(mapFormToProjectRolePayload(data));
        router.push("/project-role-master");
      }}
      onCancel={() => router.push("/project-role-master")}
    />
  );
}
