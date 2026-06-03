export const SESSION_COOKIE_NAME = "admin_session";
export const BACKEND_ACCESS_COOKIE_NAME =
  process.env.NEXT_PUBLIC_BACKEND_ACCESS_COOKIE || "access_token";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
