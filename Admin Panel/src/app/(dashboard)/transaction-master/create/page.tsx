"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildTransactionFormConfig,
  getEmptyTransactionFormData,
  mapFormToTransactionPayload,
} from "@/lib/transaction-form-config";
import { CreateTransaction } from "@/services/api/transactions.api";

export default function CreateTransactionPage() {
  const router = useRouter();

  const config = useMemo(
    () => buildTransactionFormConfig("create", getEmptyTransactionFormData()),
    []
  );

  return (
    <DynamicForm
      config={config}
      onSubmit={async (data) => {
        await CreateTransaction(mapFormToTransactionPayload(data));
        router.push("/transaction-master");
      }}
      onCancel={() => router.push("/transaction-master")}
    />
  );
}
