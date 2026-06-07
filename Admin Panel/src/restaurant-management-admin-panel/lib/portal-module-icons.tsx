import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Calendar,
  ClipboardList,
  CreditCard,
  FolderKanban,
  GitBranch,
  Landmark,
  Layers,
  LayoutGrid,
  Receipt,
  ShoppingBag,
  ShieldCheck,
  Store,
  UserCog,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { toModuleKey } from "@/lib/permission-modules";

const PARENT_ICON_MAP: Record<string, LucideIcon> = {
  management: FolderKanban,
  billing: CreditCard,
  restaurant: UtensilsCrossed,
  restaurant_management: UtensilsCrossed,
};

const CHILD_ICON_MAP: Record<string, LucideIcon> = {
  bank_master: Landmark,
  bank: Landmark,
  permission_master: ShieldCheck,
  permissions: ShieldCheck,
  role_master: UserCog,
  roles: UserCog,
  plans_master: Layers,
  plans: Layers,
  plan_master: Layers,
  user_master: Users,
  users: Users,
  client_management: Users,
  client_master: Users,
  customer_master: Users,
  customer_management: Users,
  customer_mangement: Users,
  customers: Users,
  floor_master: Layers,
  floors: Layers,
  table_master: LayoutGrid,
  tables: LayoutGrid,
  tabel_master: LayoutGrid,
  menu_master: UtensilsCrossed,
  menu: UtensilsCrossed,
  menus: UtensilsCrossed,
  restaurant_menu_master: UtensilsCrossed,
  restaurant_customer_management: Users,
  restaurant_customers: Users,
  restaurant_floor_master: Layers,
  restaurant_table_master: LayoutGrid,
  restaurant_booking_master: Calendar,
  restaurant_order_master: ShoppingBag,
  order_master: ShoppingBag,
  orders: ShoppingBag,
  restaurant_live_tables: LayoutGrid,
  live_tables: LayoutGrid,
  restaurant_transaction_master: Receipt,
  restaurant_payment_master: Banknote,
  restaurant_master: Store,
  restaurant: UtensilsCrossed,
  payment_type_master: Wallet,
  payment_master: Banknote,
  payments: Banknote,
  transaction_master: Receipt,
  transactions: Receipt,
  plans_tracker: ClipboardList,
  plan_tracker: ClipboardList,
  employee_master: Users,
  employee: Users,
  employees: Users,
};

export function getParentModuleIcon(name: string): LucideIcon {
  const key = toModuleKey(name);
  return PARENT_ICON_MAP[key] ?? FolderKanban;
}

export function getChildModuleIcon(name: string): LucideIcon {
  const key = toModuleKey(name);
  return CHILD_ICON_MAP[key] ?? GitBranch;
}

interface PortalNavIconProps {
  icon: LucideIcon;
  active?: boolean;
  className?: string;
}

export function PortalNavIcon({
  icon: Icon,
  active = false,
  className,
}: PortalNavIconProps) {
  return (
    <Icon
      className={[
        "size-4 shrink-0",
        active ? "text-primary" : "text-sidebar-foreground/80",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    />
  );
}
