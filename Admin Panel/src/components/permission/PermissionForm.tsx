"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PermissionMatrix } from "@/components/permission/PermissionMatrix";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { countPermissionModules } from "@/lib/permission-modules";
import type {
  ModulesPermissionMap,
  PermissionModuleGroup,
} from "@/types/permission-master.types";

export interface RoleOption {
  id: number;
  role_name: string;
  role_code?: string;
}

interface PermissionFormProps {
  mode: "create" | "edit" | "view";
  moduleRows: PermissionModuleGroup[];
  roles: RoleOption[];
  roleId: number | "";
  modules: ModulesPermissionMap;
  roleName?: string;
  loading?: boolean;
  submitting?: boolean;
  usedRoleIds?: number[];
  onRoleChange?: (roleId: number | "") => void;
  onModulesChange?: (modules: ModulesPermissionMap) => void;
  onSubmit?: () => Promise<void>;
  onCancel?: () => void;
  onEdit?: () => void;
}

export function PermissionForm({
  mode,
  moduleRows,
  roles,
  roleId,
  modules,
  roleName,
  loading = false,
  submitting = false,
  usedRoleIds = [],
  onRoleChange,
  onModulesChange,
  onSubmit,
  onCancel,
  onEdit,
}: PermissionFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const readOnly = mode === "view";

  const availableRoles = useMemo(() => {
    if (mode !== "create") return roles;
    const used = new Set(usedRoleIds);
    return roles.filter((r) => !used.has(r.id));
  }, [mode, roles, usedRoleIds]);

  const moduleCount = useMemo(
    () => countPermissionModules(moduleRows),
    [moduleRows]
  );

  const title =
    mode === "view"
      ? "View Permission"
      : mode === "edit"
        ? "Edit Permission"
        : "Create Permission";

  const subtitle =
    mode === "view"
      ? "Role-wise module permissions (read-only)."
      : mode === "edit"
        ? "Update module access for the selected role."
        : "Assign module permissions to a role.";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly || !onSubmit) return;
    if (!roleId) {
      setError("Please select a role.");
      return;
    }
    setError("");
    try {
      await onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save permission");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="role_id">Role</Label>
            {readOnly || mode === "edit" ? (
              <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium">
                {roleName || (roleId ? `Role #${roleId}` : "—")}
              </p>
            ) : (
              <select
                id="role_id"
                value={roleId}
                onChange={(e) =>
                  onRoleChange?.(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                <option value="">Select role</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.role_name}
                    {role.role_code ? ` (${role.role_code})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="space-y-2">
            <Label>Modules</Label>
            <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              {moduleCount} module{moduleCount === 1 ? "" : "s"} available
              {moduleRows.length > 0 &&
                ` (${moduleRows.length} parent${moduleRows.length === 1 ? "" : "s"})`}
            </p>
          </div>
        </div>
      </div>

      <PermissionMatrix
        moduleRows={moduleRows}
        value={modules}
        onChange={onModulesChange}
        readOnly={readOnly}
      />

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center gap-3 border-t bg-background/95 px-1 py-4 backdrop-blur">
        {readOnly ? (
          <>
            <Button type="button" variant="outline" onClick={onCancel}>
              Back
            </Button>
            {onEdit && (
              <Button type="button" onClick={onEdit}>
                Edit Permission
              </Button>
            )}
          </>
        ) : (
          <>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {mode === "edit" ? "Update Permission" : "Create Permission"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={onCancel ?? (() => router.push("/permission-master"))}
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
