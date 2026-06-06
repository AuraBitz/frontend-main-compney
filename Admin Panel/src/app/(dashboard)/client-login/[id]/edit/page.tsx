"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildClientLoginFormConfig,
  enrichClientLoginFormData,
  mapClientLoginToFormData,
  mapFormToClientLoginPayload,
} from "@/lib/client-login-form-config";
import { defaultListQuery } from "@/lib/list-query";
import { GetAllProjectRolesList } from "@/services/api/project-role-master.api";
import {
  GetClientLoginById,
  UpdateClientLogin,
} from "@/services/api/client-login.api";

export default function EditClientLoginPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(
    null
  );
  const [roleOptions, setRoleOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([GetClientLoginById(id), GetAllProjectRolesList(defaultListQuery)])
      .then(([account, roles]) => {
        const options = roles.rows.map((r) => ({
          label: `${r.role_name} (${r.code})`,
          value: String(r.id),
        }));
        setRoleOptions(options);
        setInitialData(
          enrichClientLoginFormData(mapClientLoginToFormData(account), {
            roleOptions: options,
          })
        );
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load account")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const config = useMemo(
    () =>
      initialData ? buildClientLoginFormConfig("edit", initialData) : null,
    [initialData]
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
        {loading ? "Loading account..." : "Account not found."}
      </p>
    );
  }

  return (
    <DynamicForm
      config={config}
      loading={loading}
      onSubmit={async (data) => {
        await UpdateClientLogin(id, mapFormToClientLoginPayload(data));
        router.push("/client-login");
      }}
      onCancel={() => router.push("/client-login")}
    />
  );
}
