import type { NextConfig } from "next";

const apiProxy = process.env.API_PROXY_URL || "http://127.0.0.1:4001";

/** Proxy only backend module paths — not /api/auth (Admin Panel JSON routes). */
const backendApiPrefixes = [
  "client-login",
  "client-management",
  "parent-modules",
  "sub-modules",
  "child-modules",
  "plans",
  "plans-tracker",
  "projects",
  "roles-master",
  "payment-type-master",
  "transactions-master",
  "permissions-master",
  "restaurant-master",
  "project-permission-master",
  "project-role-master",
  "employee-master",
  "employee-login",
  "restaurant-menu-master",
  "restaurant-customer-management",
  "restaurant-floor-master",
  "restaurant-table-master",
  "restaurant-booking-master",
  "restaurant-transaction-master",
  "restaurant-order-management",
  "restaurant-payment-master",
  "restaurant-live-table-matrix-master",
  "health",
] as const;

const nextConfig: NextConfig = {
  async rewrites() {
    return backendApiPrefixes.map((prefix) => ({
      source: `/api/${prefix}/:path*`,
      destination: `${apiProxy}/api/${prefix}/:path*`,
    }));
  },
};

export default nextConfig;
