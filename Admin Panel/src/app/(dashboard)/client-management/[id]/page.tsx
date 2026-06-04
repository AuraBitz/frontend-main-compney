"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildClientFormConfig,
  enrichClientFormData,
  mapClientToFormData,
} from "@/lib/client-form-config";
import { loadClientFormOptions } from "@/lib/load-client-form-options";
import { GetClientById } from "@/services/api/client-management.api";
import { GetClientLoginById } from "@/services/api/client-login.api";

export default function ViewClientPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(
    null
  );
  const [formOptions, setFormOptions] = useState<
    Awaited<ReturnType<typeof loadClientFormOptions>>
  >({});
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([GetClientById(id), loadClientFormOptions()])
      .then(async ([client, options]) => {
        setFormOptions(options);
        let login = null;
        if (client.login_id) {
          try {
            login = await GetClientLoginById(client.login_id);
          } catch {
            login = null;
          }
        }
        setInitialData(
          enrichClientFormData(
            mapClientToFormData(client, login ?? undefined),
            options
          )
        );
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load client")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const config = useMemo(
    () =>
      initialData
        ? buildClientFormConfig("view", initialData, formOptions)
        : null,
    [initialData, formOptions]
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
        {loading ? "Loading client..." : "Client not found."}
      </p>
    );
  }

  return (
    <DynamicForm
      config={config}
      loading={loading}
      onSubmit={async () => {}}
      onCancel={() => router.push("/client-management")}
      onEdit={() => router.push(`/client-management/${id}/edit`)}
    />
  );
}
