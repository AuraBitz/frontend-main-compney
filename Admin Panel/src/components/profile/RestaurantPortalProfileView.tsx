"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Store,
  User,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildFilterClause } from "@/lib/filter-builder-v2";
import { formatINR } from "@/lib/format-currency";
import {
  listQueryForProject,
  listQueryForRestaurant,
} from "@/lib/list-query";
import { isClientLoginUser } from "@/lib/project-access";
import {
  GetAllClientManagementList,
  UpdateClientManagement,
} from "@/services/api/client-management.api";
import { useAuth } from "@/store";
import {
  useProjectPortal,
} from "@/store/project-portal";
import type { ClientManagementRow } from "@/types/client-management.types";
import { formatDateDDMMYYYY, formatDateDisplayIST } from "@/utils/format-date";

function ProfileField({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground break-words">
            {value?.trim() || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

interface ProfileFormState {
  owner_name: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

function toFormState(
  client: ClientManagementRow | null,
  fallbackOwner: string,
  fallbackEmail?: string | null
): ProfileFormState {
  return {
    owner_name: client?.owner_name?.trim() || fallbackOwner,
    mobile: client?.mobile?.trim() || "",
    email: client?.email?.trim() || fallbackEmail?.trim() || "",
    address: client?.address?.trim() || "",
    city: client?.city?.trim() || "",
    state: client?.state?.trim() || "",
    country: client?.country?.trim() || "",
  };
}

export function RestaurantPortalProfileView() {
  const { user } = useAuth();
  const { session, enterPortal } = useProjectPortal();
  const [client, setClient] = useState<ClientManagementRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ProfileFormState>({
    owner_name: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "",
  });

  const restaurantName =
    session?.restaurantName?.trim() ||
    client?.restaurant_name?.trim() ||
    "Restaurant";
  const ownerName =
    session?.ownerName?.trim() || client?.owner_name?.trim() || "Owner";

  const loadProfile = useCallback(async () => {
    if (!session?.projectId) return;

    setLoading(true);
    setError("");

    try {
      if (session.restaurantId) {
        const result = await GetAllClientManagementList(
          listQueryForRestaurant(session.restaurantId)
        );
        setClient(result.rows[0] ?? null);
        return;
      }

      if (isClientLoginUser(user) && user?.email) {
        const result = await GetAllClientManagementList({
          ...listQueryForProject(session.projectId),
          limit: 1,
          filters: {
            project_id: buildFilterClause("equals", session.projectId),
            email: buildFilterClause("equals", user.email),
          },
        });
        setClient(result.rows[0] ?? null);
        return;
      }

      setClient(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
      setClient(null);
    } finally {
      setLoading(false);
    }
  }, [session?.projectId, session?.restaurantId, user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    setForm(toFormState(client, ownerName, user?.email));
  }, [client, ownerName, user?.email]);

  const handleStartEdit = () => {
    setForm(toFormState(client, ownerName, user?.email));
    setEditing(true);
    setError("");
  };

  const handleCancelEdit = () => {
    setForm(toFormState(client, ownerName, user?.email));
    setEditing(false);
  };

  const handleSave = async () => {
    if (!client?.id) {
      setError("Profile record not found.");
      return;
    }
    if (!form.owner_name.trim()) {
      setError("Owner name is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await UpdateClientManagement(client.id, {
        owner_name: form.owner_name.trim(),
        mobile: form.mobile.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        country: form.country.trim() || null,
      });

      if (session) {
        enterPortal({
          ...session,
          ownerName: form.owner_name.trim(),
        });
      }

      await loadProfile();
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!session) {
    return (
      <p className="text-sm text-muted-foreground">
        No restaurant portal active.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/15 via-background to-amber-500/10 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-2xl font-bold text-white shadow-lg">
              {(editing ? form.owner_name : ownerName).slice(0, 1).toUpperCase()}
            </div>
            <div>
              <Badge className="mb-2 bg-orange-500/15 text-orange-700 hover:bg-orange-500/15">
                Restaurant owner
              </Badge>
              <h1 className="font-heading text-2xl font-bold tracking-tight">
                {editing ? form.owner_name || "Owner" : ownerName}
              </h1>
              <p className="text-sm text-muted-foreground">{restaurantName}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!loading && client?.plan_status ? (
              <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm shadow-sm">
                <p className="text-xs text-muted-foreground">Plan status</p>
                <p className="font-semibold capitalize">{client.plan_status}</p>
              </div>
            ) : null}
            {client?.id && !editing ? (
              <Button type="button" variant="outline" onClick={handleStartEdit}>
                <Pencil className="size-4" />
                Edit profile
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {editing ? (
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-base font-semibold">Edit profile</h2>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleCancelEdit}
              aria-label="Cancel editing"
            >
              <X className="size-4" />
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="profile-owner">Owner name</Label>
              <Input
                id="profile-owner"
                value={form.owner_name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, owner_name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-mobile">Mobile</Label>
              <Input
                id="profile-mobile"
                value={form.mobile}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, mobile: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="profile-address">Address</Label>
              <Input
                id="profile-address"
                value={form.address}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-city">City</Label>
              <Input
                id="profile-city"
                value={form.city}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, city: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-state">State</Label>
              <Input
                id="profile-state"
                value={form.state}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, state: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-country">Country</Label>
              <Input
                id="profile-country"
                value={form.country}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, country: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSave()} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Save changes
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <ProfileField icon={User} label="Owner name" value={ownerName} />
          <ProfileField icon={Store} label="Restaurant" value={restaurantName} />
          <ProfileField icon={Mail} label="Email" value={client?.email ?? user?.email} />
          <ProfileField icon={Phone} label="Mobile" value={client?.mobile} />
          <ProfileField
            icon={Calendar}
            label="Joined at"
            value={
              client?.created_at ? formatDateDDMMYYYY(client.created_at) : undefined
            }
          />
          <ProfileField
            icon={MapPin}
            label="Address"
            value={[client?.address, client?.city, client?.state, client?.country]
              .filter(Boolean)
              .join(", ")}
            className="sm:col-span-2"
          />
        </div>
      )}

      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
          <CreditCard className="size-4 text-primary" />
          Subscription details
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="flex justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2 text-sm">
            <dt className="text-muted-foreground">Plan type</dt>
            <dd className="font-medium">{loading ? "…" : client?.plan_type || "—"}</dd>
          </div>
          <div className="flex justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2 text-sm">
            <dt className="text-muted-foreground">Plan amount</dt>
            <dd className="font-medium">
              {loading ? "…" : formatINR(client?.plan_amount)}
            </dd>
          </div>
          <div className="flex justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2 text-sm">
            <dt className="text-muted-foreground">Remaining days</dt>
            <dd className="font-medium">
              {loading
                ? "…"
                : client?.plan_remain_days != null
                  ? `${client.plan_remain_days} days`
                  : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2 text-sm">
            <dt className="text-muted-foreground">Plan started</dt>
            <dd className="font-medium">
              {loading
                ? "…"
                : client?.plan_start_at
                  ? formatDateDisplayIST(client.plan_start_at)
                  : "—"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
