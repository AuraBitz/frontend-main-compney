"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Store } from "lucide-react";
import { DynamicForm } from "@/components/form/dynamic-form";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/layout/PageHeader";
import { buildRestaurantPortalSession } from "@/lib/open-restaurant-portal";
import {
  buildRestaurantFormConfig,
  mapRestaurantToFormData,
} from "@/restaurant-management-admin-panel/lib/restaurant-master-form-config";
import { GetClientLoginById } from "@/services/api/client-login.api";
import { GetRestaurantById } from "@/services/api/restaurant-master.api";
import { useProjectPortal } from "@/store/project-portal";

interface PortalRestaurantViewProps {
  recordId: string;
  listPath: string;
  projectName: string;
}

export function PortalRestaurantView({
  recordId,
  listPath,
  projectName,
}: PortalRestaurantViewProps) {
  const router = useRouter();
  const { enterPortal } = useProjectPortal();
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(
    null
  );
  const [error, setError] = useState("");
  const [checkError, setCheckError] = useState("");

  useEffect(() => {
    GetRestaurantById(recordId)
      .then(async (row) => {
        let login = null;
        if (row.created_by) {
          try {
            login = await GetClientLoginById(row.created_by);
          } catch {
            login = null;
          }
        }
        setInitialData({
          ...mapRestaurantToFormData(row),
          owner_name: row.owner_name ?? "",
          login_email: row.restaurant_email ?? login?.email ?? "",
          username: login?.username ?? "",
        });
        setError("");
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load restaurant"
        )
      )
      .finally(() => setLoading(false));
  }, [recordId]);

  const config = useMemo(
    () =>
      initialData ? buildRestaurantFormConfig("view", initialData) : null,
    [initialData]
  );

  const handleCheckRestaurant = async () => {
    setChecking(true);
    setCheckError("");
    try {
      const session = await buildRestaurantPortalSession(recordId, listPath);
      enterPortal(session);
      router.push(`/portal/project/${session.projectId}`);
    } catch (err) {
      setCheckError(
        err instanceof Error
          ? err.message
          : "Failed to open restaurant portal."
      );
    } finally {
      setChecking(false);
    }
  };

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="View Restaurant"
        description={`${projectName} — restaurant details`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="h-10 gap-2"
              onClick={() => router.push(listPath)}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button
              className="h-10 gap-2"
              disabled={loading || checking}
              onClick={handleCheckRestaurant}
            >
              <Store className="size-4" />
              {checking ? "Opening..." : "Check Restaurant"}
            </Button>
          </div>
        }
      />
      {checkError && (
        <p className="text-sm text-destructive" role="alert">
          {checkError}
        </p>
      )}
      {!config ? (
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading restaurant..." : "Restaurant not found."}
        </p>
      ) : (
        <DynamicForm
          config={config}
          loading={loading}
          onSubmit={async () => {}}
          onCancel={() => router.push(listPath)}
        />
      )}
    </div>
  );
}
