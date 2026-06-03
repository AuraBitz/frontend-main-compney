const serverApiUrl = (
  process.env.API_SERVER_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:4001"
).replace(/\/$/, "");

/**
 * Browser: same-origin `/api` (Next rewrites → backend) so JWT cookie works.
 * Server: direct backend URL.
 */
export const API_BASE_URL =
  typeof window !== "undefined" ? "" : serverApiUrl;

/** Server-side login/API calls — prefer direct Node backend URL */
export const API_SERVER_URL = (
  process.env.API_SERVER_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:4001"
).replace(/\/$/, "");

export const API_PREFIX = "/api";

export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
