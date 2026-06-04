"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildClientFormConfig,
  getEmptyClientFormData,
  mapFormToClientPayload,
  mapFormToLoginPayload,
} from "@/lib/client-form-config";
import { loadClientFormOptions } from "@/lib/load-client-form-options";
import { CreateClientManagement } from "@/services/api/client-management.api";
import { CreateClientLogin } from "@/services/api/client-login.api";

interface LoginRow {
  id: number;
}

export default function CreateClientPage() {
  const router = useRouter();
  const [formOptions, setFormOptions] = useState<
    Awaited<ReturnType<typeof loadClientFormOptions>>
  >({});
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    loadClientFormOptions()
      .then(setFormOptions)
      .finally(() => setOptionsLoading(false));
  }, []);

  const config = useMemo(
    () =>
      buildClientFormConfig("create", getEmptyClientFormData(), formOptions),
    [formOptions]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const loginRow = (await CreateClientLogin(
      mapFormToLoginPayload(data)
    )) as LoginRow;
    const loginId =
      loginRow && typeof loginRow === "object" && "id" in loginRow
        ? Number(loginRow.id)
        : null;

    await CreateClientManagement(mapFormToClientPayload(data, loginId));
    router.push("/client-management");
  };

  return (
    <DynamicForm
      config={config}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/client-management")}
      loading={optionsLoading}
    />
  );
}
