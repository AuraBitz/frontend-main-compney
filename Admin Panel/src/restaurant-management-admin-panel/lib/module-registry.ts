import { toModuleKey } from "@/lib/permission-modules";
import {
  portalChildCreatePath,
  portalChildPath,
} from "@/restaurant-management-admin-panel/lib/portal-routes";
import type { ProjectPortalSession } from "@/store/project-portal";

export type PortalFeatureKey =
  | "client_management"
  | "transaction_master"
  | "payment_type_master"
  | "role_master"
  | "plans_master"
  | "plans_tracker"
  | "permission_master"
  | "bank_master"
  | "restaurant_master"
  | "parent_modules"
  | "child_modules"
  | "employee_master"
  | "menu_master"
  | "restaurant_customer_management"
  | "restaurant_floor_master"
  | "restaurant_table_master"
  | "restaurant_booking_master"
  | "restaurant_order_master"
  | "restaurant_transaction_master"
  | "restaurant_payment_master"
  | "restaurant_live_tables"
  | "generic";

export interface PortalModuleFeature {
  featureKey: PortalFeatureKey;
  title: string;
  description: string;
  supportsCreate: boolean;
  projectScoped: boolean;
}

const CHILD_ALIASES: Record<string, PortalFeatureKey> = {
  user_master: "client_management",
  client_management: "client_management",
  clients: "client_management",
  client_master: "client_management",
  customer_master: "client_management",
  customer_management: "client_management",
  customer_mangement: "restaurant_customer_management",
  customers: "client_management",
  transaction_master: "transaction_master",
  transactions: "transaction_master",
  payment_type_master: "payment_type_master",
  payment_master: "transaction_master",
  payments: "transaction_master",
  restaurant_payment_master: "restaurant_payment_master",
  restaurant_transaction_master: "restaurant_transaction_master",
  role_master: "role_master",
  roles: "role_master",
  plans_master: "plans_master",
  plans: "plans_master",
  plan_master: "plans_master",
  plans_tracker: "plans_tracker",
  plan_tracker: "plans_tracker",
  permission_master: "permission_master",
  permissions: "permission_master",
  bank_master: "bank_master",
  bank: "bank_master",
  restaurant_master: "restaurant_master",
  restaurant: "restaurant_master",
  restaurants: "restaurant_master",
  parent_modules: "parent_modules",
  parent_module: "parent_modules",
  parent_module_master: "parent_modules",
  parent: "parent_modules",
  modules: "parent_modules",
  child_modules: "child_modules",
  child_module: "child_modules",
  child_module_master: "child_modules",
  child: "child_modules",
  employee_master: "employee_master",
  employee: "employee_master",
  employees: "employee_master",
  menu_master: "menu_master",
  menu: "menu_master",
  menus: "menu_master",
  restaurant_menu_master: "menu_master",
  restaurant_customer_management: "restaurant_customer_management",
  restaurant_customers: "restaurant_customer_management",
  restaurant_floor_master: "restaurant_floor_master",
  floor_master: "restaurant_floor_master",
  floors: "restaurant_floor_master",
  restaurant_table_master: "restaurant_table_master",
  table_master: "restaurant_table_master",
  tables: "restaurant_table_master",
  restaurant_booking_master: "restaurant_booking_master",
  booking_master: "restaurant_booking_master",
  bookings: "restaurant_booking_master",
  restaurant_order_master: "restaurant_order_master",
  order_master: "restaurant_order_master",
  orders: "restaurant_order_master",
  live_tables: "restaurant_live_tables",
  live_table: "restaurant_live_tables",
  restaurant_live_tables: "restaurant_live_tables",
};

const FEATURE_META: Record<
  PortalFeatureKey,
  Omit<PortalModuleFeature, "featureKey">
> = {
  client_management: {
    title: "Clients",
    description: "Project clients and users",
    supportsCreate: false,
    projectScoped: true,
  },
  transaction_master: {
    title: "Transactions",
    description: "Payment transactions for this project",
    supportsCreate: true,
    projectScoped: true,
  },
  payment_type_master: {
    title: "Payment Types",
    description: "Payment type master",
    supportsCreate: true,
    projectScoped: false,
  },
  role_master: {
    title: "Roles",
    description: "Roles linked to this project",
    supportsCreate: true,
    projectScoped: true,
  },
  plans_master: {
    title: "Plans",
    description: "Plans for this project",
    supportsCreate: true,
    projectScoped: true,
  },
  plans_tracker: {
    title: "Plans Tracker",
    description: "Plan purchase history for this project",
    supportsCreate: false,
    projectScoped: true,
  },
  permission_master: {
    title: "Permissions",
    description: "Role-wise module permissions",
    supportsCreate: true,
    projectScoped: false,
  },
  bank_master: {
    title: "Bank Master",
    description: "Bank accounts (coming soon)",
    supportsCreate: false,
    projectScoped: true,
  },
  restaurant_master: {
    title: "Restaurant Master",
    description: "Restaurants for this project",
    supportsCreate: true,
    projectScoped: true,
  },
  parent_modules: {
    title: "Parent Modules",
    description: "Parent modules for this project",
    supportsCreate: true,
    projectScoped: true,
  },
  child_modules: {
    title: "Child Modules",
    description: "Child modules under this project's parents",
    supportsCreate: true,
    projectScoped: true,
  },
  employee_master: {
    title: "Employee Master",
    description: "Employees linked to this project",
    supportsCreate: true,
    projectScoped: true,
  },
  menu_master: {
    title: "Menu Master",
    description: "Restaurant menu categories and items",
    supportsCreate: true,
    projectScoped: false,
  },
  restaurant_customer_management: {
    title: "Customer Management",
    description: "Restaurant customers",
    supportsCreate: false,
    projectScoped: false,
  },
  restaurant_floor_master: {
    title: "Floor Master",
    description: "Restaurant floors",
    supportsCreate: true,
    projectScoped: false,
  },
  restaurant_table_master: {
    title: "Table Master",
    description: "Restaurant tables",
    supportsCreate: true,
    projectScoped: false,
  },
  restaurant_booking_master: {
    title: "Booking Master",
    description: "Table bookings",
    supportsCreate: true,
    projectScoped: false,
  },
  restaurant_order_master: {
    title: "Order Master",
    description: "Dine-in orders with auto order numbers",
    supportsCreate: true,
    projectScoped: false,
  },
  restaurant_transaction_master: {
    title: "Transaction Master",
    description: "Restaurant customer transactions",
    supportsCreate: true,
    projectScoped: false,
  },
  restaurant_payment_master: {
    title: "Payment Master",
    description: "Restaurant order payments",
    supportsCreate: true,
    projectScoped: false,
  },
  restaurant_live_tables: {
    title: "Live Tables",
    description: "Interactive floor plan with live table status",
    supportsCreate: false,
    projectScoped: false,
  },
  generic: {
    title: "Module",
    description: "Module workspace",
    supportsCreate: false,
    projectScoped: false,
  },
};

export function resolveChildModuleKey(
  parentName: string,
  childName: string
): string {
  const parentKey = toModuleKey(parentName);
  const childKey = toModuleKey(childName);
  return `${parentKey}_${childKey}`;
}

const RESTAURANT_CUSTOMER_ALIASES = new Set([
  "customer_management",
  "customer_mangement",
  "customer_master",
  "customers",
  "clients",
  "client_management",
  "client_master",
  "user_master",
  "restaurant_customer_management",
]);

const RESTAURANT_FLOOR_ALIASES = new Set([
  "restaurant_floor_master",
  "floor_master",
  "floors",
]);

const RESTAURANT_LIVE_TABLES_ALIASES = new Set([
  "restaurant_live_tables",
  "live_tables",
  "live_table",
]);

const RESTAURANT_TABLE_ALIASES = new Set([
  "restaurant_table_master",
  "table_master",
  "tables",
  "tabel_master",
]);

const RESTAURANT_BOOKING_ALIASES = new Set([
  "restaurant_booking_master",
  "booking_master",
  "bookings",
]);

const RESTAURANT_ORDER_ALIASES = new Set([
  "restaurant_order_master",
  "order_master",
  "orders",
]);

const RESTAURANT_MENU_ALIASES = new Set([
  "menu_master",
  "menu",
  "menus",
  "restaurant_menu_master",
]);

const RESTAURANT_TRANSACTION_ALIASES = new Set([
  "restaurant_transaction_master",
  "transaction_master",
  "transactions",
]);

const RESTAURANT_PAYMENT_ALIASES = new Set([
  "restaurant_payment_master",
  "payment_master",
  "payments",
]);

function matchesRestaurantCustomerKey(childKey: string): boolean {
  if (RESTAURANT_CUSTOMER_ALIASES.has(childKey)) return true;
  return childKey.includes("customer") || childKey.includes("client");
}

function matchesRestaurantBookingKey(childKey: string): boolean {
  if (RESTAURANT_BOOKING_ALIASES.has(childKey)) return true;
  return childKey.includes("booking");
}

function matchesRestaurantOrderMasterKey(childKey: string): boolean {
  if (RESTAURANT_ORDER_ALIASES.has(childKey)) return true;
  if (childKey.includes("order_management")) return false;
  return childKey.includes("order") && !childKey.includes("payment");
}

function matchesRestaurantFloorKey(childKey: string): boolean {
  if (RESTAURANT_FLOOR_ALIASES.has(childKey)) return true;
  return childKey.includes("floor");
}

function matchesRestaurantLiveTablesKey(childKey: string): boolean {
  if (RESTAURANT_LIVE_TABLES_ALIASES.has(childKey)) return true;
  return childKey.includes("live") && childKey.includes("table");
}

function matchesRestaurantTableKey(childKey: string): boolean {
  if (matchesRestaurantLiveTablesKey(childKey)) return false;
  if (RESTAURANT_TABLE_ALIASES.has(childKey)) return true;
  return childKey.includes("table") && !childKey.includes("restaurant_master");
}

function matchesRestaurantMenuKey(childKey: string): boolean {
  if (RESTAURANT_MENU_ALIASES.has(childKey)) return true;
  return childKey.includes("menu");
}

function matchesRestaurantTransactionKey(childKey: string): boolean {
  if (RESTAURANT_TRANSACTION_ALIASES.has(childKey)) return true;
  return childKey.includes("transaction");
}

function matchesRestaurantPaymentKey(childKey: string): boolean {
  if (RESTAURANT_PAYMENT_ALIASES.has(childKey)) return true;
  return (
    childKey.includes("payment") &&
    !childKey.includes("payment_type")
  );
}

function restaurantFeature(
  featureKey: Exclude<
    PortalFeatureKey,
    "generic" | "client_management" | "bank_master"
  >,
  childName: string
): PortalModuleFeature {
  const meta = FEATURE_META[featureKey];
  return {
    featureKey,
    ...meta,
    title: childName.trim() || meta.title,
  };
}

export function resolvePortalFeature(
  parentName: string,
  childName: string
): PortalModuleFeature {
  const childKey = toModuleKey(childName);
  const featureKey = CHILD_ALIASES[childKey] ?? "generic";
  const meta = FEATURE_META[featureKey];
  return {
    featureKey,
    ...meta,
    title: childName.trim() || meta.title,
  };
}

/** Restaurant portal overrides project-scoped customer module. */
export function resolveEffectivePortalFeature(
  childName: string,
  feature: PortalModuleFeature,
  session: ProjectPortalSession
): PortalModuleFeature {
  if (session.viewMode !== "restaurant") {
    return feature;
  }

  const childKey = toModuleKey(childName);

  if (matchesRestaurantCustomerKey(childKey)) {
    return restaurantFeature("restaurant_customer_management", childName);
  }
  if (matchesRestaurantFloorKey(childKey)) {
    return restaurantFeature("restaurant_floor_master", childName);
  }
  if (matchesRestaurantLiveTablesKey(childKey)) {
    return restaurantFeature("restaurant_live_tables", childName);
  }
  if (matchesRestaurantTableKey(childKey)) {
    return restaurantFeature("restaurant_table_master", childName);
  }
  if (matchesRestaurantBookingKey(childKey)) {
    return restaurantFeature("restaurant_booking_master", childName);
  }
  if (matchesRestaurantOrderMasterKey(childKey)) {
    return restaurantFeature("restaurant_order_master", childName);
  }
  if (matchesRestaurantMenuKey(childKey)) {
    return restaurantFeature("menu_master", childName);
  }
  if (matchesRestaurantTransactionKey(childKey)) {
    return restaurantFeature("restaurant_transaction_master", childName);
  }
  if (matchesRestaurantPaymentKey(childKey)) {
    return restaurantFeature("restaurant_payment_master", childName);
  }

  return feature;
}

export function getPortalFeaturePaths(
  projectId: number,
  parentModuleId: number,
  childModuleId: number
) {
  return {
    list: portalChildPath(projectId, parentModuleId, childModuleId),
    create: portalChildCreatePath(projectId, parentModuleId, childModuleId),
  };
}
