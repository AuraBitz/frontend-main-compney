"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PermissionForm } from "@/components/permission/PermissionForm";
import {
  buildEmptyModulesMap,
  loadPermissionModuleRows,
} from "@/lib/permission-modules";
import { defaultListQuery } from "@/lib/list-query";
import { CreatePermission, GetAllPermissionsList } from "@/services/api/permissions.api";
import { GetAllRolesList } from "@/services/api/roles.api";
import type { ModulesPermissionMap } from "@/types/permission-master.types";

export default function CreatePermissionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [moduleRows, setModuleRows] = useState<
    Awaited<ReturnType<typeof loadPermissionModuleRows>>
  >([]);
  const [roles, setRoles] = useState<
    { id: number; role_name: string; role_code?: string }[]
  >([]);
  const [usedRoleIds, setUsedRoleIds] = useState<number[]>([]);
  const [roleId, setRoleId] = useState<number | "">("");
  const [modules, setModules] = useState<ModulesPermissionMap>({});

  useEffect(() => {
    Promise.all([
      loadPermissionModuleRows(),
      GetAllRolesList(defaultListQuery),
      GetAllPermissionsList(defaultListQuery),
    ])
      .then(([modulesCatalog, rolesResult, permissionsResult]) => {
        setModuleRows(modulesCatalog);
        setRoles(rolesResult.rows);
        setUsedRoleIds(permissionsResult.rows.map((p) => p.role_id));
        setModules(buildEmptyModulesMap(modulesCatalog));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PermissionForm
      mode="create"
      loading={loading}
      submitting={submitting}
      moduleRows={moduleRows}
      roles={roles}
      roleId={roleId}
      modules={modules}
      usedRoleIds={usedRoleIds}
      onRoleChange={setRoleId}
      onModulesChange={setModules}
      onCancel={() => router.push("/permission-master")}
      onSubmit={async () => {
        if (!roleId) return;
        setSubmitting(true);
        try {
          await CreatePermission({ role_id: roleId, modules });
          router.push("/permission-master");
        } finally {
          setSubmitting(false);
        }
      }}
    />
  );
}
