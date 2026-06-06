"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GetRestaurantCustomerById } from "@/services/api/restaurant-customer-management.api";
import { formatDateDDMMYYYY } from "@/utils/format-date";

interface PortalRestaurantCustomerViewProps {
  recordId: string;
  onCancel: () => void;
}

export function PortalRestaurantCustomerView({
  recordId,
  onCancel,
}: PortalRestaurantCustomerViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [row, setRow] = useState<Awaited<
    ReturnType<typeof GetRestaurantCustomerById>
  > | null>(null);

  useEffect(() => {
    GetRestaurantCustomerById(recordId)
      .then((data) => {
        setRow(data);
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load customer")
      )
      .finally(() => setLoading(false));
  }, [recordId]);

  if (loading) {
    return <Loader2 className="size-5 animate-spin text-muted-foreground" />;
  }

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (!row) {
    return <p className="text-sm text-muted-foreground">Customer not found.</p>;
  }

  return (
    <div className="space-y-6">
      <dl className="grid gap-4 sm:grid-cols-2">
        <Field label="Customer name" value={row.customer_name} />
        <Field label="Email" value={row.email} />
        <Field label="Phone" value={row.phone} />
        <Field label="Status" value={row.current_status} />
        <Field
          label="Manual booking"
          value={row.is_manual_booking ? "Yes" : "No"}
        />
        <Field
          label="Has login"
          value={row.is_not_login ? "No login" : "Login linked"}
        />
        <Field
          label="Joined at"
          value={row.created_at ? formatDateDDMMYYYY(row.created_at) : null}
        />
        <Field label="Address" value={row.address} className="sm:col-span-2" />
      </dl>
      <Button type="button" variant="outline" onClick={onCancel}>
        Back
      </Button>
    </div>
  );
}

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value?: string | null;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value?.trim() || "—"}</dd>
    </div>
  );
}
