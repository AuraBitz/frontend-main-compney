"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildRoleFormConfig,
  getEmptyRoleFormData,
  mapFormToRolePayload,
} from "@/lib/role-form-config";
import { loadRoleFormOptions } from "@/lib/load-role-form-options";
import { CreateRole } from "@/services/api/roles.api";

export default function CreateRolePage() {
  const router = useRouter();
  const [formOptions, setFormOptions] = useState<
    Awaited<ReturnType<typeof loadRoleFormOptions>>
  >({});
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    loadRoleFormOptions()
      .then(setFormOptions)
      .finally(() => setOptionsLoading(false));
  }, []);

  const config = useMemo(
    () => buildRoleFormConfig("create", getEmptyRoleFormData(), formOptions),
    [formOptions]
  );

  return (
    <DynamicForm
      config={config}
      loading={optionsLoading}
      onSubmit={async (data) => {
        await CreateRole(mapFormToRolePayload(data));
        router.push("/role-master");
      }}
      onCancel={() => router.push("/role-master")}
    />
  );
}
