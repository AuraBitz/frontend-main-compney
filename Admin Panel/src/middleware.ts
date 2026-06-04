import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth-token";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { canAccessRoute } from "@/config/permissions";
import { AUTH_ROUTES, PROTECTED_PATHS } from "@/routes";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isLogin = AUTH_ROUTES.includes(pathname);
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isLogin && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtected && !session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isProtected && session && !canAccessRoute(session.role, pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard",
    "/dashboard/:path*",
    "/client-management",
    "/client-management/:path*",
    "/client-login",
    "/client-login/:path*",
    "/parent-modules",
    "/parent-modules/:path*",
    "/sub-modules",
    "/sub-modules/:path*",
    "/plans",
    "/plans/:path*",
    "/plans-tracker",
    "/plans-tracker/:path*",
    "/projects",
    "/projects/:path*",
    "/portal",
    "/portal/:path*",
    "/role-master",
    "/role-master/:path*",
  ],
};
