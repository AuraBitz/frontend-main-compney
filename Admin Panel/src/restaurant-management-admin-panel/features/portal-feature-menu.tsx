"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUrlOrUpload } from "@/components/form/ImageUrlOrUpload";
import { MenuItemsEditor } from "@/restaurant-management-admin-panel/components/MenuItemsEditor";
import { parseMenuItems } from "@/restaurant-management-admin-panel/lib/menu-items-utils";
import {
  CreateRestaurantMenu,
  GetRestaurantMenuById,
  UpdateRestaurantMenu,
} from "@/services/api/restaurant-menu-master.api";
import type { MenuCategoryRow } from "@/types/restaurant-ops.types";

interface PortalMenuFormProps {
  mode: "create" | "edit" | "view";
  restaurantId: number;
  recordId?: string;
  onDone: () => void;
  onCancel: () => void;
  onEdit?: () => void;
}

export function PortalMenuForm({
  mode,
  restaurantId,
  recordId,
  onDone,
  onCancel,
  onEdit,
}: PortalMenuFormProps) {
  const [loading, setLoading] = useState(mode !== "create");
  const [submitting, setSubmitting] = useState(false);
  const [thaliName, setThaliName] = useState("");
  const [thaliImage, setThaliImage] = useState("");
  const [menuItems, setMenuItems] = useState<MenuCategoryRow[]>([]);
  const [error, setError] = useState("");
  const readOnly = mode === "view";

  useEffect(() => {
    if (mode === "create" || !recordId) {
      setLoading(false);
      return;
    }
    GetRestaurantMenuById(recordId)
      .then((row) => {
        setThaliName(row.restaurant_thali_name ?? "");
        setThaliImage(row.thali_image ?? "");
        setMenuItems(parseMenuItems(row.menu_items));
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load menu")
      )
      .finally(() => setLoading(false));
  }, [mode, recordId]);

  const handleSubmit = async () => {
    if (!thaliName.trim()) {
      setError("Thali / menu name is required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        restaurant_id: restaurantId,
        restaurant_thali_name: thaliName.trim(),
        thali_image: thaliImage.trim() || null,
        menu_items: menuItems,
      };
      if (mode === "create") {
        await CreateRestaurantMenu(payload);
      } else if (recordId) {
        await UpdateRestaurantMenu(recordId, {
          restaurant_thali_name: thaliName.trim(),
          thali_image: thaliImage.trim() || null,
          menu_items: menuItems,
        });
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save menu");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader2 className="size-5 animate-spin text-muted-foreground" />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="max-w-md space-y-4">
        <div className="space-y-2">
          <Label>Thali / Menu name</Label>
          <Input
            value={thaliName}
            readOnly={readOnly}
            placeholder="e.g. Lunch Thali"
            onChange={(e) => setThaliName(e.target.value)}
          />
        </div>
        <ImageUrlOrUpload
          label="Thali image"
          value={thaliImage}
          onChange={setThaliImage}
          disabled={readOnly}
          hint="Paste image URL or upload (max 2MB)."
        />
      </div>
      <div>
        <Label className="mb-2 block">Menu categories & items</Label>
        <MenuItemsEditor
          value={menuItems}
          onChange={setMenuItems}
          readOnly={readOnly}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {!readOnly && (
          <Button type="button" disabled={submitting} onClick={handleSubmit}>
            {submitting
              ? "Saving..."
              : mode === "create"
                ? "Create Menu"
                : "Update Menu"}
          </Button>
        )}
        {readOnly && onEdit && (
          <Button type="button" onClick={onEdit}>
            Edit
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onCancel}>
          Back
        </Button>
      </div>
    </div>
  );
}
