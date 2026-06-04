import type { NextConfig } from "next";

const apiProxy = process.env.API_PROXY_URL || "http://127.0.0.1:4001";

/** Proxy only backend module paths — not /api/auth (Admin Panel JSON routes). */
const backendApiPrefixes = [
  "client-login",
  "client-management",
  "parent-modules",
  "sub-modules",
  "plans",
  "plans-tracker",
  "projects",
  "roles-master",
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
