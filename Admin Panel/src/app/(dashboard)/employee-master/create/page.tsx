"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildEmployeeFormConfig,
  getEmptyEmployeeFormData,
  mapFormToEmployeePayload,
} from "@/lib/employee-form-config";
import { defaultListQuery } from "@/lib/list-query";
import { CreateEmployee } from "@/services/api/employee-master.api";
import { GetAllProjectRolesList } from "@/services/api/project-role-master.api";

export default function CreateEmployeePage() {
  const router = useRouter();
  const [roleOptions, setRoleOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetAllProjectRolesList(defaultListQuery)
      .then((roles) => {
        setRoleOptions(
          roles.rows.map((r) => ({
            label: `${r.role_name} (${r.code})`,
            value: String(r.id),
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const config = useMemo(
    () =>
      buildEmployeeFormConfig("create", getEmptyEmployeeFormData(), {
        roleOptions,
      }),
    [roleOptions]
  );

  return (
    <DynamicForm
      config={config}
      loading={loading}
      onSubmit={async (data) => {
        if (!String(data.password ?? "").trim()) {
          throw new Error("Login password is required.");
        }
        await CreateEmployee(mapFormToEmployeePayload(data));
        router.push("/employee-master");
      }}
      onCancel={() => router.push("/employee-master")}
    />
  );
}
