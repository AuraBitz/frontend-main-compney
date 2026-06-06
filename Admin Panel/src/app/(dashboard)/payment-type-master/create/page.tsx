"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildPaymentTypeFormConfig,
  getEmptyPaymentTypeFormData,
  mapFormToPaymentTypePayload,
} from "@/lib/payment-type-form-config";
import { CreatePaymentType } from "@/services/api/payment-type.api";

export default function CreatePaymentTypePage() {
  const router = useRouter();

  const config = useMemo(
    () => buildPaymentTypeFormConfig("create", getEmptyPaymentTypeFormData()),
    []
  );

  return (
    <DynamicForm
      config={config}
      onSubmit={async (data) => {
        await CreatePaymentType(mapFormToPaymentTypePayload(data));
        router.push("/payment-type-master");
      }}
      onCancel={() => router.push("/payment-type-master")}
    />
  );
}
