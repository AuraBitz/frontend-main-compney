"use client";

import { useEffect, useState } from "react";
import { PermissionForm } from "@/components/permission/PermissionForm";
import {
  loadPermissionModuleRows,
  mergeModulesWithCatalog,
} from "@/lib/permission-modules";
import { defaultListQuery } from "@/lib/list-query";
import {
  GetPermissionById,
  UpdatePermission,
} from "@/services/api/permissions.api";
import { GetAllRolesList } from "@/services/api/roles.api";
import type { ModulesPermissionMap } from "@/types/permission-master.types";

interface PortalPermissionFormProps {
  permissionId: string;
  mode: "view" | "edit";
  onDone: () => void;
  onCancel: () => void;
}

export function PortalPermissionForm({
  permissionId,
  mode,
  onDone,
  onCancel,
}: PortalPermissionFormProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
      GetPermissionById(permissionId),
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
  }, [permissionId]);

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (mode === "view") {
    return (
      <PermissionForm
        mode="view"
        loading={loading}
        moduleRows={moduleRows}
        roles={roles}
        roleId={roleId}
        roleName={roleName}
        modules={modules}
        onCancel={onCancel}
        onEdit={onDone}
      />
    );
  }

  return (
    <PermissionForm
      mode="edit"
      loading={loading}
      submitting={submitting}
      moduleRows={moduleRows}
      roles={roles}
      roleId={roleId}
      roleName={roleName}
      modules={modules}
      onModulesChange={setModules}
      onCancel={onCancel}
      onSubmit={async () => {
        if (!roleId) return;
        setSubmitting(true);
        try {
          await UpdatePermission(permissionId, { role_id: roleId, modules });
          onDone();
        } finally {
          setSubmitting(false);
        }
      }}
    />
  );
}
