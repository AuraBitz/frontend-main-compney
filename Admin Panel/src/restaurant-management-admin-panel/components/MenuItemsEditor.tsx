"use client";

import { Plus, Trash2 } from "lucide-react";
import { ImageUrlOrUpload } from "@/components/form/ImageUrlOrUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nextMenuId } from "@/restaurant-management-admin-panel/lib/menu-items-utils";
import {
  isMenuItemAvailable,
  normalizeAvailableStatus,
  withCategoryAvailability,
} from "@/restaurant-management-admin-panel/lib/menu-availability-utils";
import type { MenuAvailableStatus, MenuCategoryRow, MenuItemRow } from "@/types/restaurant-ops.types";
import { formatINR } from "@/lib/format-currency";

interface MenuItemsEditorProps {
  value: MenuCategoryRow[];
  onChange: (next: MenuCategoryRow[]) => void;
  readOnly?: boolean;
}

function ItemPreview({ src, name }: { src?: string | null; name: string }) {
  const url = src?.trim();
  if (!url) return null;
  return (
    <div className="mt-2 overflow-hidden rounded-md border border-border/60 bg-muted/30">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={name || "Item"}
        className="aspect-[4/3] w-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}

function AvailabilitySelect({
  value,
  onChange,
  disabled = false,
  label,
}: {
  value?: MenuAvailableStatus;
  onChange: (next: MenuAvailableStatus) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div className="w-40">
      <Label className="text-xs">{label}</Label>
      <select
        className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-2 text-xs"
        value={normalizeAvailableStatus(value)}
        disabled={disabled}
        onChange={(e) =>
          onChange(e.target.value as MenuAvailableStatus)
        }
      >
        <option value="available">Available</option>
        <option value="not_available">Not available</option>
      </select>
    </div>
  );
}

export function MenuItemsEditor({
  value,
  onChange,
  readOnly = false,
}: MenuItemsEditorProps) {
  const categories = value ?? [];

  const updateCategory = (index: number, patch: Partial<MenuCategoryRow>) => {
    const next = categories.map((cat, i) => {
      if (i !== index) return cat;
      const merged = { ...cat, ...patch };
      if (patch.available_status === "not_available") {
        return {
          ...merged,
          items: (merged.items ?? []).map((item) => ({
            ...item,
            available_status: "not_available" as const,
          })),
        };
      }
      return merged;
    });
    onChange(next);
  };

  const addCategory = () => {
    onChange([
      ...categories,
      {
        id: nextMenuId(categories),
        title: "",
        available_status: "available",
        items: [],
      },
    ]);
  };

  const removeCategory = (index: number) => {
    onChange(categories.filter((_, i) => i !== index));
  };

  const addItem = (catIndex: number) => {
    const cat = categories[catIndex];
    const items = cat?.items ?? [];
    updateCategory(catIndex, {
      items: [
        ...items,
        { id: nextMenuId(items), name: "", amount: 0, image: "", available_status: "available" },
      ],
    });
  };

  const updateItem = (
    catIndex: number,
    itemIndex: number,
    patch: Partial<MenuItemRow>
  ) => {
    const cat = categories[catIndex];
    const items = (cat?.items ?? []).map((item, i) =>
      i === itemIndex ? { ...item, ...patch } : item
    );
    updateCategory(catIndex, { items });
  };

  const removeItem = (catIndex: number, itemIndex: number) => {
    const cat = categories[catIndex];
    updateCategory(catIndex, {
      items: (cat?.items ?? []).filter((_, i) => i !== itemIndex),
    });
  };

  if (readOnly) {
    if (!categories.length) {
      return <p className="text-sm text-muted-foreground">No menu items.</p>;
    }
    return (
      <div className="space-y-6">
        {categories.map((cat) => {
          const resolved = withCategoryAvailability(cat);
          return (
          <div key={cat.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{cat.title || "—"}</p>
              {normalizeAvailableStatus(cat.available_status) === "not_available" ? (
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                  Category unavailable
                </span>
              ) : null}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {(resolved.items ?? []).map((item) => (
                <article
                  key={item.id}
                  className={`overflow-hidden rounded-xl border bg-card ${
                    isMenuItemAvailable(item, cat)
                      ? "border-border/80"
                      : "border-destructive/30 opacity-70"
                  }`}
                >
                  <ItemPreview src={item.image} name={item.name} />
                  <div className="space-y-1 p-3">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-sm font-medium text-primary">
                      {formatINR(item.amount)}
                    </p>
                    {!isMenuItemAvailable(item, cat) ? (
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-destructive">
                        Not available
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        );})}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((cat, catIndex) => (
        <div
          key={cat.id}
          className="rounded-lg border border-border/80 bg-muted/20 p-4"
        >
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[200px] flex-1">
              <Label>Category title</Label>
              <Input
                value={cat.title}
                placeholder="e.g. Beverage"
                onChange={(e) =>
                  updateCategory(catIndex, { title: e.target.value })
                }
              />
            </div>
            <AvailabilitySelect
              label="Category availability"
              value={cat.available_status}
              onChange={(available_status) =>
                updateCategory(catIndex, { available_status })
              }
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={() => removeCategory(catIndex)}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>
          <div className="mt-3 space-y-3">
            {(cat.items ?? []).map((item, itemIndex) => (
              <div
                key={item.id}
                className="rounded-lg border border-border/60 bg-background p-3 pl-4"
              >
                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-[160px] flex-1">
                    <Label className="text-xs">Item name</Label>
                    <Input
                      value={item.name}
                      placeholder="e.g. hot coffee"
                      onChange={(e) =>
                        updateItem(catIndex, itemIndex, {
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="w-28">
                    <Label className="text-xs">Amount</Label>
                    <Input
                      type="number"
                      min={0}
                      value={item.amount}
                      onChange={(e) =>
                        updateItem(catIndex, itemIndex, {
                          amount: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <AvailabilitySelect
                    label="Item availability"
                    value={item.available_status}
                    disabled={
                      normalizeAvailableStatus(cat.available_status) ===
                      "not_available"
                    }
                    onChange={(available_status) =>
                      updateItem(catIndex, itemIndex, { available_status })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(catIndex, itemIndex)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
                <div className="mt-2">
                  <ImageUrlOrUpload
                    label="Item image"
                    value={item.image ?? ""}
                    onChange={(image) =>
                      updateItem(catIndex, itemIndex, { image })
                    }
                    hint="URL or upload image for this item."
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() => addItem(catIndex)}
            >
              <Plus className="size-4" />
              Add item
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addCategory}>
        <Plus className="size-4" />
        Add category
      </Button>
    </div>
  );
}
