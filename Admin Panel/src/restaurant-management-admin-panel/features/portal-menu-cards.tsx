"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Pencil, Trash2, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PortalChildContext } from "@/restaurant-management-admin-panel/hooks/use-portal-child-module";
import {
  countMenuItems,
  parseMenuItems,
} from "@/restaurant-management-admin-panel/lib/menu-items-utils";
import {
  isMenuItemAvailable,
  normalizeAvailableStatus,
  withCategoryAvailability,
} from "@/restaurant-management-admin-panel/lib/menu-availability-utils";
import { restaurantListQuery } from "@/restaurant-management-admin-panel/lib/restaurant-portal-scope";
import { portalChildRecordEditPath } from "@/restaurant-management-admin-panel/lib/portal-routes";
import {
  DeleteRestaurantMenu,
  GetAllRestaurantMenusList,
} from "@/services/api/restaurant-menu-master.api";
import { useAuth } from "@/store";
import type {
  MenuCategoryRow,
  MenuItemRow,
  RestaurantMenuRow,
} from "@/types/restaurant-ops.types";
import { formatINR } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

interface RestaurantMenuCardsProps {
  ctx: PortalChildContext;
}

function thaliCoverImage(menu: RestaurantMenuRow): string | null {
  if (menu.thali_image?.trim()) return menu.thali_image.trim();
  const categories = parseMenuItems(menu.menu_items);
  for (const cat of categories) {
    for (const item of cat.items ?? []) {
      if (item.image?.trim()) return item.image.trim();
    }
  }
  return null;
}

function MenuItemImage({ src, alt }: { src?: string | null; alt: string }) {
  const url = src?.trim();
  if (url) {
    return (
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
    );
  }
  return (
    <div className="flex aspect-4/3 w-full items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
      <UtensilsCrossed className="size-8 opacity-40" />
    </div>
  );
}

function ItemCard({
  item,
  category,
}: {
  item: MenuItemRow;
  category: MenuCategoryRow;
}) {
  const available = isMenuItemAvailable(item, category);
  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-sm",
        available ? "border-border/80" : "border-destructive/30 opacity-75"
      )}
    >
      <MenuItemImage src={item.image} alt={item.name || "Menu item"} />
      <div className="space-y-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold text-foreground">
          {item.name || "—"}
        </p>
        <p className="text-sm font-medium text-primary tabular-nums">
          {formatINR(item.amount)}
        </p>
        {!available ? (
          <p className="text-[10px] font-bold uppercase tracking-wide text-destructive">
            Not available
          </p>
        ) : null}
      </div>
    </article>
  );
}

function CategorySection({ category }: { category: MenuCategoryRow }) {
  const resolved = withCategoryAvailability(category);
  const items = resolved.items ?? [];
  if (!items.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="font-heading text-base font-semibold text-foreground">
          {category.title || "Category"}
        </h4>
        {normalizeAvailableStatus(category.available_status) === "not_available" ? (
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
            Category unavailable
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} category={category} />
        ))}
      </div>
    </section>
  );
}

export function RestaurantMenuCards({ ctx }: RestaurantMenuCardsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [menus, setMenus] = useState<RestaurantMenuRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const query = useMemo(
    () => restaurantListQuery(ctx.session, user),
    [ctx.session, user]
  );

  const loadMenus = useCallback(async () => {
    setLoading(true);
    try {
      const result = await GetAllRestaurantMenusList(query);
      setMenus(result.rows);
      setSelectedId((prev) =>
        prev != null && result.rows.some((r) => r.id === prev) ? prev : null
      );
    } catch {
      setMenus([]);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadMenus();
  }, [loadMenus]);

  const selected = menus.find((m) => m.id === selectedId) ?? null;
  const selectedCategories = useMemo(
    () => (selected ? parseMenuItems(selected.menu_items) : []),
    [selected]
  );

  const handleDelete = async (menu: RestaurantMenuRow) => {
    if (
      !window.confirm(
        `Delete thali "${menu.restaurant_thali_name}"? This cannot be undone.`
      )
    ) {
      return;
    }
    setDeletingId(menu.id);
    try {
      await DeleteRestaurantMenu(menu.id);
      if (selectedId === menu.id) setSelectedId(null);
      await loadMenus();
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading menus…
      </div>
    );
  }

  if (!menus.length) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-10 text-center">
        <p className="text-sm font-medium text-foreground">No thali menus yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Use Create above to add your first thali.
        </p>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setSelectedId(null)}
            >
              <ArrowLeft className="size-4" />
              All thalis
            </Button>
            <div>
              <h3 className="font-heading text-lg font-semibold">
                {selected.restaurant_thali_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {countMenuItems(selectedCategories)} items
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              router.push(
                portalChildRecordEditPath(
                  ctx.session.projectId,
                  ctx.parentId,
                  ctx.childId,
                  selected.id
                )
              )
            }
          >
            <Pencil className="size-3.5" />
            Edit thali
          </Button>
        </div>

        <div className="space-y-6">
          {selectedCategories.length ? (
            selectedCategories.map((cat) => (
              <CategorySection key={cat.id} category={cat} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No categories or items in this thali yet.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {menus.length} thali{menus.length === 1 ? "" : "s"} · click a card to
        view items
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {menus.map((menu) => {
          const cover = thaliCoverImage(menu);
          const itemCount = countMenuItems(parseMenuItems(menu.menu_items));

          return (
            <article
              key={menu.id}
              className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setSelectedId(menu.id)}
              >
                {cover ? (
                  <div className="aspect-5/3 w-full bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover}
                      alt={menu.restaurant_thali_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-5/3 items-center justify-center bg-linear-to-br from-primary/15 to-muted">
                    <UtensilsCrossed className="size-10 text-primary/50" />
                  </div>
                )}
                <div className="space-y-1 p-4">
                  <h3 className="font-heading text-base font-semibold leading-tight">
                    {menu.restaurant_thali_name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {itemCount} item{itemCount === 1 ? "" : "s"}
                  </p>
                </div>
              </button>
              <div className="flex gap-2 border-t border-border/60 p-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 flex-1 gap-1"
                  onClick={() =>
                    router.push(
                      portalChildRecordEditPath(
                        ctx.session.projectId,
                        ctx.parentId,
                        ctx.childId,
                        menu.id
                      )
                    )
                  }
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={cn(
                    "h-8 gap-1 text-destructive hover:text-destructive",
                    deletingId === menu.id && "opacity-60"
                  )}
                  disabled={deletingId === menu.id}
                  onClick={() => void handleDelete(menu)}
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
