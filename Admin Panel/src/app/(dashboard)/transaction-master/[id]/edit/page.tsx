"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildTransactionFormConfig,
  enrichTransactionFormData,
  mapFormToTransactionPayload,
  mapTransactionToFormData,
} from "@/lib/transaction-form-config";
import { loadTransactionFormOptions } from "@/lib/load-transaction-form-options";
import { GetTransactionById, UpdateTransaction } from "@/services/api/transactions.api";

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(
    null
  );
  const [formOptions, setFormOptions] = useState<
    Awaited<ReturnType<typeof loadTransactionFormOptions>>
  >({});
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([GetTransactionById(id), loadTransactionFormOptions()])
      .then(([row, options]) => {
        setFormOptions(options);
        setInitialData(
          enrichTransactionFormData(mapTransactionToFormData(row), options)
        );
        setError("");
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load transaction"
        )
      )
      .finally(() => setLoading(false));
  }, [id]);

  const config = useMemo(
    () =>
      initialData ? buildTransactionFormConfig("edit", initialData) : null,
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
        {loading ? "Loading transaction..." : "Transaction not found."}
      </p>
    );
  }

  return (
    <DynamicForm
      config={config}
      loading={loading}
      onSubmit={async (data) => {
        await UpdateTransaction(id, mapFormToTransactionPayload(data));
        router.push("/transaction-master");
      }}
      onCancel={() => router.push("/transaction-master")}
    />
  );
}
