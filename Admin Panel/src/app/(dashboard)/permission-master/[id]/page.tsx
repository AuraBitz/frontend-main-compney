"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PermissionForm } from "@/components/permission/PermissionForm";
import {
  loadPermissionModuleRows,
  mergeModulesWithCatalog,
} from "@/lib/permission-modules";
import { defaultListQuery } from "@/lib/list-query";
import { GetPermissionById } from "@/services/api/permissions.api";
import { GetAllRolesList } from "@/services/api/roles.api";
import type { ModulesPermissionMap } from "@/types/permission-master.types";

export default function ViewPermissionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [moduleRows, setModuleRows] = useState<
    Awaited<ReturnType<typeof loadPermissionModuleRows>>
  >([]);
  const [roles, setRoles] = useState<
    { id: number; role_name: string; role_code?: string }[]
  >([]);
  const [roleId, setRoleId] = useState<number | "">("");
  const [roleName, setRoleName] = useState("");
  const [modules, setModules] = useState<ModulesPermissionMap>({});
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      GetPermissionById(id),
      loadPermissionModuleRows(),
      GetAllRolesList(defaultListQuery),
    ])
      .then(([permission, modulesCatalog, rolesResult]) => {
        setModuleRows(modulesCatalog);
        setRoles(rolesResult.rows);
        setRoleId(permission.role_id);
        setRoleName(
          permission.role_name
            ? permission.role_code
              ? `${permission.role_name} (${permission.role_code})`
              : permission.role_name
            : ""
        );
        setModules(
          mergeModulesWithCatalog(permission.modules, modulesCatalog)
        );
        setError("");
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load permission"
        )
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  return (
    <PermissionForm
      mode="view"
      loading={loading}
      moduleRows={moduleRows}
      roles={roles}
      roleId={roleId}
      roleName={roleName}
      modules={modules}
      onCancel={() => router.push("/permission-master")}
      onEdit={() => router.push(`/permission-master/${id}/edit`)}
    />
  );
}
