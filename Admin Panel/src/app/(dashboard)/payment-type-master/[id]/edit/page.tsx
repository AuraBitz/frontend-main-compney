"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildPaymentTypeFormConfig,
  mapFormToPaymentTypePayload,
  mapPaymentTypeToFormData,
} from "@/lib/payment-type-form-config";
import { GetPaymentTypeById, UpdatePaymentType } from "@/services/api/payment-type.api";

export default function EditPaymentTypePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    GetPaymentTypeById(id)
      .then((row) => {
        setInitialData(mapPaymentTypeToFormData(row));
        setError("");
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load payment type"
        )
      )
      .finally(() => setLoading(false));
  }, [id]);

  const config = useMemo(
    () =>
      initialData ? buildPaymentTypeFormConfig("edit", initialData) : null,
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
        {loading ? "Loading payment type..." : "Payment type not found."}
      </p>
    );
  }

  return (
    <DynamicForm
      config={config}
      loading={loading}
      onSubmit={async (data) => {
        await UpdatePaymentType(id, mapFormToPaymentTypePayload(data));
        router.push("/payment-type-master");
      }}
      onCancel={() => router.push("/payment-type-master")}
    />
  );
}
