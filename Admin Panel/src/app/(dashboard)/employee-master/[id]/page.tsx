"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DynamicForm } from "@/components/form/dynamic-form";
import {
  buildEmployeeFormConfig,
  enrichEmployeeFormData,
  mapEmployeeToFormData,
} from "@/lib/employee-form-config";
import { defaultListQuery } from "@/lib/list-query";
import { GetEmployeeById } from "@/services/api/employee-master.api";
import { GetAllProjectRolesList } from "@/services/api/project-role-master.api";

export default function ViewEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([GetEmployeeById(id), GetAllProjectRolesList(defaultListQuery)])
      .then(([employee, roles]) => {
        const roleOptions = roles.rows.map((r) => ({
          label: `${r.role_name} (${r.code})`,
          value: String(r.id),
        }));
        setInitialData(
          enrichEmployeeFormData(mapEmployeeToFormData(employee), { roleOptions })
        );
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load employee")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const config = useMemo(
    () =>
      initialData ? buildEmployeeFormConfig("view", initialData) : null,
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
        {loading ? "Loading employee..." : "Employee not found."}
      </p>
    );
  }

  return (
    <DynamicForm
      config={config}
      loading={loading}
      onSubmit={async () => {}}
      onCancel={() => router.push("/employee-master")}
      onEdit={() => router.push(`/employee-master/${id}/edit`)}
    />
  );
}
